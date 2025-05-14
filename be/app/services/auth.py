from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.models.user import UserCreate, UserInDB, get_password_hash, verify_password
from app.config.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    user_dict = await db.users.find_one({"email": email})
    if user_dict:
        user_dict["id"] = str(user_dict.pop("_id"))
        return UserInDB(**user_dict)
    return None


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> Optional[UserInDB]:
    try:
        user_dict = await db.users.find_one({"_id": ObjectId(user_id)})
        if user_dict:
            user_dict["id"] = str(user_dict.pop("_id"))
            return UserInDB(**user_dict)
    except:
        return None
    return None


async def create_user(db: AsyncIOMotorDatabase, user: UserCreate) -> UserInDB:
    if await get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["created_at"] = datetime.utcnow()
    user_dict["is_active"] = True

    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)

    return UserInDB(**user_dict)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def authenticate_user(
    db: AsyncIOMotorDatabase, email: str, password: str
) -> Optional[UserInDB]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
