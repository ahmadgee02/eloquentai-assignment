import re
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from ..utils.jwt_handler import decode_access_token
from ..database import user_collection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def snake_to_camel(snake_str):
    parts = snake_str.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

def agent_log_snake_to_camel(agent_log: dict) -> dict:
    return {snake_to_camel(k): v for k, v in agent_log.items()}

def camel_to_snake(name: str) -> str:
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def agent_log_camel_to_snake(agent_log: dict) -> dict:
    return {camel_to_snake(k): v for k, v in agent_log.items()}


# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")


    user = user_collection.find_one({"email": payload.get("email")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user