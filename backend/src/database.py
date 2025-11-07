from pymongo import MongoClient
from .config import settings

client = MongoClient(settings.DATABASE_URL)
db = client["user_db"]
user_collection = db["users"]
chat_collection = db["chats"]