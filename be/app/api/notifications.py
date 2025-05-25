from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.notification import notification_service
from app.api.deps import get_current_user
from app.models.device import DeviceModel

router = APIRouter()

class NotificationRequest(BaseModel):
    title: str
    body: str
    data: Optional[dict] = None

class SingleNotificationRequest(NotificationRequest):
    token: str

class MulticastNotificationRequest(NotificationRequest):
    tokens: List[str]

@router.post("/register-device")
async def register_device(
    fcm_token: str,
    device_type: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Register a new device for push notifications
    """
    device = await DeviceModel.create(
        user_id=current_user.id,
        fcm_token=fcm_token,
        device_type=device_type
    )
    return {"message": "Device registered successfully", "device_id": str(device.id)}

@router.post("/send-notification")
async def send_notification(
    request: SingleNotificationRequest,
):
    """
    Send a notification to a single device
    """
    success = await notification_service.send_notification(
        token=request.token,
        title=request.title,
        body=request.body,
        data=request.data
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send notification")
    
    return {"message": "Notification sent successfully"}

@router.post("/send-multicast-notification")
async def send_multicast_notification(
    request: MulticastNotificationRequest,
):
    """
    Send a notification to multiple devices
    """
    success = await notification_service.send_notifications_individually(
        tokens=request.tokens,
        title=request.title,
        body=request.body,
        data=request.data
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send multicast notification")
    
    return {"message": "Multicast notification sent successfully"}

@router.post("/send-weather-alert")
async def send_weather_alert(
    title: str,
    body: str,
):
    """
    Send a weather alert to all registered devices
    """
    devices = await DeviceModel.find_all()
    tokens = [device.fcm_token for device in devices if device.fcm_token]

    if not tokens:
        raise HTTPException(status_code=404, detail="No registered devices found")

    success = await notification_service.send_notifications_individually(
        tokens=tokens,
        title=title,
        body=body,
        data={"type": "weather_alert"}
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send weather alert")
    
    return {"message": "Weather alert sent successfully"}
