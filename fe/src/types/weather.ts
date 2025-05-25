export interface WeatherData {
  city: string,
  country?: string,
  temperature: number,
  feels_like?: number,
  humidity: number,
  pressure: number,
  wind_speed: number,
  description: string,
  icon?: string,
  timestamp: string,
  coordinates?: {
    lat: number,
    lon: number
  }
}

export interface ForecastItem {
  date: string;
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  description: string;
  icon?: string;
}

export interface ForecastData {
  city: string;
  country?: string;
  list: ForecastItem[];
}

export interface SavedLocation {
  id?: string;
  user_id?: string;
  location: {
    city: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  is_default: boolean;
}
