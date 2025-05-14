from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta

from app.models.user import UserCreate, User
from app.services.auth import (
    create_user,
    authenticate_user,
    create_access_token,
    get_user_by_email,
)
from app.config.settings import ACCESS_TOKEN_EXPIRE_MINUTES
from app.api.deps import get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    db_user = await create_user(db, user)
    return db_user


@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
