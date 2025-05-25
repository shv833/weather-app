import axios from 'axios';
import { API_URL } from '../config';

const authApi = axios.create({
  baseURL: API_URL,
});

export const login = async (username: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await authApi.post('/api/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
    throw error;
  }
};

export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await authApi.post('/api/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
    throw error;
  }
};

export const checkToken = async (token: string) => {
  try {
    const response = await authApi.get('/api/locations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { valid: true };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const registerDeviceToken = async (deviceToken: string, token: string) => {
  try {
    const response = await authApi.post(
      '/auth/register-device',
      { deviceToken },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to register device');
    }
    throw error;
  }
};