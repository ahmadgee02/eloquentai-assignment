from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..schemas.user import LoginUser, RegisterUser
from ..database import user_collection
from ..utils.jwt_handler import verify_password, create_access_token, decode_access_token, hash_password
from ..logger import logging
from datetime import datetime
from bson.objectid import ObjectId

router = APIRouter(prefix="/auth", tags=["login"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
logger = logging.getLogger(__name__)

# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    logger.info(f"Decoding token for user... {payload}")

    user = user_collection.find_one({"email": payload.get("email")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return payload

@router.post("/login")
def login(
    form_data: LoginUser
):
    user = user_collection.find_one({"email": form_data.email})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(
        data={
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    )

    return {"access_token": token, "token_type": "bearer"}

@router.post("/register")
def register(
    form_data: RegisterUser
):
    logger.info("Registering user... %s", form_data)
    
    existing_user = user_collection.find_one({"email": form_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered with this email"
        )

    # Hash password
    hashed_pw = hash_password(form_data.password)

    # Create user document
    new_user = {
        "name": form_data.name,
        "email": form_data.email,
        "password": hashed_pw,
        "created_at": datetime.utcnow()
    }

    # Insert into MongoDB
    result = user_collection.insert_one(new_user)

    logger.info(f"User registered successfully: {new_user['email']}")

    token = create_access_token(
        data={
            "_id": str(result.inserted_id),
            "name": new_user["name"],
            "email": new_user["email"]
        }
    )
    
    return {"access_token": token, "token_type": "bearer"}