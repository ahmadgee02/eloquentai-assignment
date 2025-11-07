from pydantic import (BaseModel, EmailStr, field_validator, Field)
from typing import Optional
from pydantic.errors import PydanticUserError
from pydantic_core import PydanticCustomError

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class RegisterUser(BaseModel):
    name: Optional[str] = Field(default="  ")
    email: EmailStr
    password: str
    
    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, v):
        print("Validating name field: %s", v)
        if not v or not v.strip():
            raise PydanticCustomError("Name is required")
        return v.strip()
    
    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, v):
        print("Validating email field: %s", v)
        if not v or not v.strip():
            raise PydanticCustomError("Email is required")
        return v.strip()



class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    isAdmin: Optional[bool] = None

