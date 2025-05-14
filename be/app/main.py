from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as weather_router
from app.api.auth import router as auth_router


app = FastAPI(title="Weather Forecast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])


@app.get("/")
async def root():
    return {"message": "Weather Forecast API is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
