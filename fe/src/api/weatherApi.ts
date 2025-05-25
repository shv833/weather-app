import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const transformWeatherData = (data: any) => {
  return {
    city: data.location.city,
    country: data.location.country,
    temperature: data.current.temp,
    feels_like: data.current.feels_like,
    humidity: data.current.humidity,
    pressure: data.current.pressure,
    wind_speed: data.current.wind_speed,
    description: data.current.weather_description,
    icon: data.current.weather_icon,
    timestamp: data.timestamp,
    coordinates: {
      lat: data.location.lat,
      lon: data.location.lon
    }
  };
};

const weatherApi = axios.create({
  baseURL: API_URL,
});

weatherApi.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchCurrentWeather = async (city: string) => {
  try {
    const response = await weatherApi.get(`/api/weather/city/${encodeURIComponent(city)}`);
    return transformWeatherData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch weather data');
    }
    throw error;
  }
};

const transformForecastData = (data: any) => {
  return {
    city: data.location.city,
    country: data.location.country,
    list: data.forecast.map((item: any) => ({
      date: new Date(item.timestamp).toISOString().split('T')[0],
      time: new Date(item.timestamp).toISOString().split('T')[1].split('.')[0],
      temperature: item.temp,
      humidity: item.humidity,
      pressure: item.pressure,
      wind_speed: item.wind_speed,
      description: item.weather_description,
      icon: item.weather_icon
    }))
  };
};

export const fetchForecast = async (city: string) => {
  try {
    const response = await weatherApi.get(`/api/weather/city/${encodeURIComponent(city)}`);
    return transformForecastData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch forecast data');
    }
    throw error;
  }
};

export const fetchWeatherByCoordinates = async (lat: number, lon: number) => {
  try {
    const response = await weatherApi.get(`/api/weather/coordinates?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch weather data for location');
    }
    throw error;
  }
};

export const getUserLocations = async () => {
  try {
    const response = await weatherApi.get('/api/locations');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch saved locations');
    }
    throw error;
  }
};

export const saveUserLocation = async (location: {
  city: string;
  country?: string;
  lat?: number;
  lon?: number;
}, isDefault: boolean = false) => {
  try {
    const response = await weatherApi.post('/api/locations', {
      location,
      is_default: isDefault,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to save location');
    }
    throw error;
  }
};