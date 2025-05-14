from fastapi import APIRouter, HTTPException, status, Depends
from app.models.weather import SavedLocation
from app.services.weather import fetch_weather_data
from app.config.settings import MONGODB_URL
from app.api.deps import get_db, get_current_user
from app.models.user import UserInDB
import motor.motor_asyncio


router = APIRouter()

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client.weather_app
weather_collection = db.weather_data
user_locations = db.user_locations


@router.get("/weather/city/{city}")
async def get_weather_by_city(city: str):
    try:
        return await fetch_weather_data(
            city=city, weather_collection=weather_collection
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weather/coordinates")
async def get_weather_by_coordinates(lat: float, lon: float):
    try:
        return await fetch_weather_data(
            lat=lat, lon=lon, weather_collection=weather_collection
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/locations", status_code=status.HTTP_201_CREATED)
async def save_user_location(
    location: SavedLocation, current_user: UserInDB = Depends(get_current_user)
):
    location.user_id = current_user.id
    result = await user_locations.insert_one(location.dict())
    return {"id": str(result.inserted_id)}


@router.get("/locations")
async def get_user_locations(current_user: UserInDB = Depends(get_current_user)):
    cursor = user_locations.find({"user_id": current_user.id})
    locations = await cursor.to_list(length=100)
    for location in locations:
        location["id"] = str(location.pop("_id"))
    return locations
