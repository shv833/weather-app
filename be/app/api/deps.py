from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import MONGODB_URL, SECRET_KEY, ALGORITHM
from app.models.user import UserInDB
from app.services.auth import get_user_by_email


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


async def get_db() -> AsyncIOMotorDatabase:
    client = AsyncIOMotorClient(MONGODB_URL)
    try:
        db = client.weather_app
        yield db
    finally:
        client.close()


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)
) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user
