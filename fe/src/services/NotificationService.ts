import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerDeviceToken } from '../api/authApi';
import { Platform } from 'react-native';
import { firebaseConfig } from '../config/firebase';

class NotificationService {
  private isWebPlatform = Platform.OS === 'web';
  private notificationCallback: ((title: string, message: string, type: 'alert' | 'update') => void) | null = null;

  constructor() {
    if (this.isWebPlatform) {
      this.initializeFirebase();
    }
  }

  setNotificationCallback(callback: (title: string, message: string, type: 'alert' | 'update') => void) {
    this.notificationCallback = callback;
  }

  async initializeFirebase() {
    try {
      if (!getApps().length) {
        initializeApp(firebaseConfig);
        console.log('Firebase initialized');
      }

      const messaging = getMessaging();

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY
      });

      if (token) {
        console.log('FCM Token:', token);
        await this.saveFCMToken(token);
      }

      onMessage(messaging, (payload: MessagePayload) => {
        console.log('Foreground message received:', payload);
        const { title, body } = payload.notification || {};
        const type = payload.data?.type === 'alert' ? 'alert' : 'update';

        if (title && body && this.notificationCallback) {
          this.notificationCallback(title, body, type);
        }
      });
    } catch (err) {
      console.error('Error initializing FCM:', err);
    }
  }

  async saveFCMToken(token: string) {
    try {
      await AsyncStorage.setItem('fcmToken', token);
      const userToken = await AsyncStorage.getItem('token');
      if (userToken) {
        await registerDeviceToken(token, userToken);
        console.log('FCM token sent to backend');
      }
    } catch (err) {
      console.error('Failed to save/send FCM token:', err);
    }
  }
}

export default new NotificationService();
