from fastapi import HTTPException
import httpx
from datetime import datetime
from app.models.weather import WeatherData, Location
from app.config.settings import OPENWEATHER_API_KEY
from motor.motor_asyncio import AsyncIOMotorCollection


async def fetch_weather_data(
    city=None, lat=None, lon=None, weather_collection: AsyncIOMotorCollection = None
):
    async with httpx.AsyncClient() as client:
        params = {"APPID": OPENWEATHER_API_KEY, "units": "metric"}

        if city:
            params["q"] = city
        elif lat is not None and lon is not None:
            params["lat"] = lat
            params["lon"] = lon
        else:
            raise HTTPException(
                status_code=400, detail="Either city or coordinates required"
            )

        current_response = await client.get(
            "https://api.openweathermap.org/data/2.5/weather", params=params
        )

        if current_response.status_code != 200:
            raise HTTPException(
                status_code=current_response.status_code,
                detail=f"Error from OpenWeather API: {current_response.text}",
            )

        current_data = current_response.json()

        forecast_params = params.copy()
        forecast_params["lat"] = current_data["coord"]["lat"]
        forecast_params["lon"] = current_data["coord"]["lon"]

        forecast_response = await client.get(
            "https://api.openweathermap.org/data/2.5/forecast", params=forecast_params
        )

        if forecast_response.status_code != 200:
            raise HTTPException(
                status_code=forecast_response.status_code,
                detail=f"Error from OpenWeather API: {forecast_response.text}",
            )

        forecast_data = forecast_response.json()

        weather_data = WeatherData(
            location=Location(
                city=current_data["name"],
                country=current_data["sys"]["country"],
                lat=current_data["coord"]["lat"],
                lon=current_data["coord"]["lon"],
            ),
            timestamp=datetime.now(),
            current={
                "temp": current_data["main"]["temp"],
                "feels_like": current_data["main"]["feels_like"],
                "humidity": current_data["main"]["humidity"],
                "pressure": current_data["main"]["pressure"],
                "wind_speed": current_data["wind"]["speed"],
                "weather_description": current_data["weather"][0]["description"],
                "weather_icon": current_data["weather"][0]["icon"],
            },
            forecast=[
                {
                    "timestamp": datetime.fromtimestamp(item["dt"]),
                    "temp": item["main"]["temp"],
                    "humidity": item["main"]["humidity"],
                    "pressure": item["main"]["pressure"],
                    "wind_speed": item["wind"]["speed"],
                    "weather_description": item["weather"][0]["description"],
                    "weather_icon": item["weather"][0]["icon"],
                }
                for item in forecast_data["list"]
            ],
        )

        if weather_collection is not None:
            weather_dict = {**weather_data.dict(), "timestamp": datetime.now()}
            await weather_collection.insert_one(weather_dict)

        return weather_data
