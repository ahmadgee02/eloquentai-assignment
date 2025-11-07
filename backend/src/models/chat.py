from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from ..models.object_id import PyObjectId
from datetime import datetime

class MessageModel(BaseModel):
    text: str
    role: str
    

class ChatModel(BaseModel):
    """
    Container for a single chat record.
    """

    # The primary key for the ChatModel, stored as a `str` on the instance.
    # This will be aliased to `_id` when sent to MongoDB,
    # but provided as `id` in the API requests and responses.
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId = Field(...)
    title: str = Field(...)
    messages: list[MessageModel] = Field(...)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "user_id": "123456789abcdef12345678",
                "title": "Chat Title",
                "messages": [],
                "created_at": "2025-11-06T20:09:19.050+00:00",
            }
        },
    )