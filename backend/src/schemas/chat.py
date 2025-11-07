from pydantic import BaseModel
from typing import Optional

class ChatReq(BaseModel):
    prompt: str
    user_id: Optional[str] = None
    chat_id: Optional[str] = None