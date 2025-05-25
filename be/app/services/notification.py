import firebase_admin
from firebase_admin import credentials, messaging
from typing import List, Optional
import os
from pathlib import Path
import json

class NotificationService:
    def __init__(self):
        cred_path = Path(__file__).parent.parent / "config" / "firebase-credentials.json"
        
        if not firebase_admin._apps:
            if not cred_path.exists():
                raise FileNotFoundError(
                    "Firebase credentials file not found. Please add firebase-credentials.json to the config directory."
                )
            
            try:
                with open(cred_path, 'r') as f:
                    cred_data = json.load(f)
                    if 'type' not in cred_data or cred_data['type'] != 'service_account':
                        raise ValueError("Invalid service account credentials. Missing or invalid 'type' field.")
                
                cred = credentials.Certificate(str(cred_path))
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized successfully")
            except Exception as e:
                print(f"Error initializing Firebase Admin SDK: {str(e)}")
                raise

    async def send_notification(self, token: str, title: str, body: str, data: Optional[dict] = None) -> bool:
        try:
            message = messaging.Message(
                notification=messaging.Notification(title=title, body=body),
                data=data or {},
                token=token,
            )
            response = messaging.send(message)
            print(f"✅ Sent to {token}: {response}")
            return True
        except Exception as e:
            print(f"❌ Failed to send to {token}: {e}")
            return False

    async def send_notifications_individually(self, tokens: List[str], title: str, body: str, data: Optional[dict] = None) -> bool:
        if not tokens:
            print("❌ No tokens provided")
            return False

        success_count = 0
        for token in tokens:
            try:
                message = messaging.Message(
                    notification=messaging.Notification(title=title, body=body),
                    data=data or {},
                    token=token,
                )
                response = messaging.send(message)
                print(f"✅ Sent to {token}: {response}")
                success_count += 1
            except Exception as e:
                print(f"❌ Failed to send to {token}: {e}")

        return success_count > 0

notification_service = NotificationService()
