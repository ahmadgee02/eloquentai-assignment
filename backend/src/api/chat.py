from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, Dict, Any
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone
from ..logger import logging

from ..ollama_support_bot import OllamaSupportBot
from ..pincone_support import PineconeEmbedder
from ..config import settings
from ..utils.data_classes import PromptConfig
from ..schemas.chat import ChatReq
from ..models.chat import ChatModel
from ..database import user_collection, chat_collection
from ..utils import get_current_user
from typing import List

router = APIRouter(prefix="/chats", tags=["chat"])
logger = logging.getLogger(__name__)


# Initialize Pinecone client (do this once)
API_KEY = settings.PINECONE_API_KEY
INDEX_NAME = settings.PINECONE_INDEX_NAME
NAMESPACE = settings.PINECONE_NAME_SPACE

pinecone_client = PineconeEmbedder(
    api_key=API_KEY,
    index_name=INDEX_NAME,
    namespace=NAMESPACE,
)

OLLAMA_MODEL = settings.OLLAMA_MODEL

bot = OllamaSupportBot(
    model=OLLAMA_MODEL
)

def _now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

@router.get(
    "/history",
    response_description="Get All chats",
    response_model=List[ChatModel]
)
def getChatHistory(current_user: str = Depends(get_current_user)):
    try:
        chats = chat_collection.find({ "user_id": current_user["_id"] }).sort("created_at", -1)
        
        return chats
    except Exception as e:
        logging.error(f"Failed to fetch chats for user {current_user['_id']}: {e}")
        return []
    
@router.get(
    "/{chat_id}",
    response_description="Get a single chat",
    response_model=ChatModel,
    dependencies=[Depends(get_current_user)]
)
def getChat(chat_id: str):
    try:
        chat = chat_collection.find_one({"_id": ObjectId(chat_id) })

        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid chat ID format")
    
    return chat


@router.delete(
    "/{chat_id}",
    response_description="Delete a single chat"
)
def deleteChat(chat_id: str):
    try:
        result = chat_collection.delete_one({"_id": ObjectId(chat_id)})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid chat id")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")

    return {"message": "Chat deleted"}


#  Can be improved to fetch user_id via JWT token
@router.post(
    "/",
    response_description="Initiate chat",
)
def InitChat(req : ChatReq):
    logger.info(f"Init Chat Request Recieved: {req}")

    prompt: str = req.prompt
    user_id: Optional[str] = getattr(req, "user_id", None)
    chat_id: Optional[str] = getattr(req, "chat_id", None)
    
    category = bot.classify_category(prompt)
    
    # create query text for vector search
    query_text = ("Category: " + category + " | Query: " if category else "") + prompt

    query_vector = pinecone_client.embed_query(query_text)
    
    # fetch relevent docs from pincone with cosine similarity
    docs = pinecone_client.query_documents(
        query_vector=query_vector
    )
    
    # rerank the relevent docs with ssimilarity with prompt
    reranked_docs = pinecone_client.rerank_results(
        query_vector=prompt,
        documents=docs
    )
    logger.info(f"Final Doc selected for LLm context: {reranked_docs}")
    
    messages= []
    
    # append old conversation if there is any
    if chat_id:
        chat = getChat(chat_id)
        messages = chat["messages"]
        
    bot_answer = bot.answer(
        user_query=prompt,
        docs=reranked_docs,
        prev_messages=messages
    )
    
    if user_id is not None:
        logger.info(f"Storing chat message for user_id: {user_id}")
        
        user = user_collection.find_one({"_id": ObjectId(user_id) })

        user_msg = {
            "role": "user",
            "text": prompt,
            "created_at": _now_utc_iso(),
        }
    
        system_msg = {
            "role": "system",
            "text": bot_answer,
            "created_at": _now_utc_iso(),
        }
        
        if chat_id:
            try:
                chat_obj_id = ObjectId(chat_id)
                chat_collection.update_one(
                    {"_id": chat_obj_id, "user_id": ObjectId(user_id)},
                    {"$push": {"messages": {"$each": [user_msg, system_msg]}}}
                )
                
                return { "response": bot_answer }
            except InvalidId:
                logger.error(f"Invalid chat_id provided: {chat_id}")
                
        elif (user):
            result = chat_collection.insert_one({
                "user_id": ObjectId(user_id),
                "title": prompt,
                "messages": [user_msg, system_msg],
                "created_at": datetime.utcnow(),
            })
            
            return { "response": bot_answer, "title": prompt, "chat_id": str(result.inserted_id) }

    return { "response": bot_answer }
