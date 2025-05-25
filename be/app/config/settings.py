import os
from dotenv import load_dotenv


load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
MONGODB_URL = os.getenv("MONGODB_URL")

SECRET_KEY = os.getenv(
    "SECRET_KEY", "your-secret-key-here"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
