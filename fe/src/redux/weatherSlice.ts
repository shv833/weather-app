import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchCurrentWeather, fetchForecast } from '../api/weatherApi';
import { WeatherData, ForecastData } from '../types/weather';

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: ForecastData | null;
  selectedCity: string;
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  currentWeather: null,
  forecast: null,
  selectedCity: 'Kyiv',
  loading: false,
  error: null,
};

export const fetchWeatherData = createAsyncThunk(
  'weather/fetchCurrent',
  async (city: string, { rejectWithValue }) => {
    try {
      return await fetchCurrentWeather(city);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch weather data');
    }
  }
);

export const fetchForecastData = createAsyncThunk(
  'weather/fetchForecast',
  async (city: string, { rejectWithValue }) => {
    try {
      return await fetchForecast(city);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch forecast data');
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setSelectedCity: (state, action: PayloadAction<string>) => {
      state.selectedCity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action: PayloadAction<WeatherData>) => {
        state.loading = false;
        state.currentWeather = action.payload;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchForecastData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForecastData.fulfilled, (state, action: PayloadAction<ForecastData>) => {
        state.loading = false;
        state.forecast = action.payload;
      })
      .addCase(fetchForecastData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCity } = weatherSlice.actions;
export default weatherSlice.reducer;
