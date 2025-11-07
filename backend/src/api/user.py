from fastapi import APIRouter, Query, HTTPException

from bson.objectid import ObjectId
from bson.errors import InvalidId

from ..models.user import UserModel
from ..schemas.user import UserRegister, UserUpdate
from ..database import user_collection
from ..utils.jwt_handler import hash_password
from ..logger import logging

router = APIRouter(prefix="/users", tags=["users"])
logger = logging.getLogger(__name__)

@router.get(
    "/",
    response_description="Get All users",
    response_model=list[UserModel]
)
def getAllUsers():
    users_data = user_collection.find()

    return users_data

@router.get(
    "/{user_id}",
    response_description="Get a single user",
    response_model=UserModel
)
def getUser(user_id: str):
    user = user_collection.find_one({"_id": user_id })
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.post(
    "/",
    response_description="Creats a single user",
    response_model=UserModel
)
def createUser(user: UserRegister):
    if user_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "isAdmin": user.isAdmin
    }

    result = user_collection.insert_one(user_dict)
    user = user_collection.find_one({"_id": result.inserted_id })

    return user


@router.put(
        "/{user_id}",
        response_description="Get a single user",
        response_model=UserModel
) 
def updateUser(user_id: str, user: UserUpdate):
    if user_collection.find_one([
            { "email": user.email },
            { "$not": { "_id": user_id }}
        ]):

        raise HTTPException(status_code=400, detail="Email already registered")
    
    update_data = {}

    if user.name is not None:
        update_data["name"] = user.name

    if user.email is not None:
        update_data["email"] = user.email

    if user.password is not None:
        update_data["password"] = hash_password(user.password)
    
    if user.isAdmin is not None:
        update_data["isAdmin"] = user.isAdmin

    logger.info("logger ====>", update_data)
    print("print ====>", update_data, user_id)

    try:
        updated_result = user_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if updated_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = user_collection.find_one({"_id": ObjectId(user_id)})
    return updated_user

@router.delete(
    "/{user_id}",
    response_description="Get a single user"
)
def deleteUser(user_id: str):
    try:
        result = user_collection.delete_one({"_id": ObjectId(user_id)})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Item deleted"}