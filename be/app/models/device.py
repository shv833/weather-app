from datetime import datetime
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import MONGODB_URL


client = AsyncIOMotorClient(MONGODB_URL)
db = client.weather_app
devices_collection = db.devices

class DeviceModel(BaseModel):
    user_id: str
    fcm_token: str
    device_type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: datetime = Field(default_factory=datetime.utcnow)

    @classmethod
    async def create(cls, user_id: str, fcm_token: str, device_type: str):
        device = cls(
            user_id=user_id,
            fcm_token=fcm_token,
            device_type=device_type
        )
        await device.save()
        return device

    async def save(self):
        await devices_collection.insert_one(self.dict())

    @classmethod
    async def find_by_token(cls, fcm_token: str):
        device_data = await devices_collection.find_one({"fcm_token": fcm_token})
        if device_data:
            return cls(**device_data)
        return None

    @classmethod
    async def find_all(cls):
        devices = []
        cursor = devices_collection.find()
        async for device in cursor:
            devices.append(cls(**device))
        return devices

    @classmethod
    async def update_last_used(cls, fcm_token: str):
        await devices_collection.update_one(
            {"fcm_token": fcm_token},
            {"$set": {"last_used": datetime.utcnow()}}
        )
