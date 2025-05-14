from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Location(BaseModel):
    city: str
    country: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class WeatherData(BaseModel):
    location: Location
    timestamp: datetime
    current: dict
    forecast: Optional[List[dict]] = None


class SavedLocation(BaseModel):
    user_id: Optional[str] = None
    location: Location
    is_default: bool = False
