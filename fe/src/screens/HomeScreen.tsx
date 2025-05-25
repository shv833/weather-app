import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeatherData, setSelectedCity } from '../redux/weatherSlice';
import { RootState, AppDispatch } from '../redux/store';
import { fetchWeatherByCoordinates } from '../api/weatherApi';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../contexts/AuthContext';

const isWeb = Platform.OS === 'web';

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentWeather, selectedCity, loading, error } = useSelector(
    (state: RootState) => state.weather
  );
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [cityInput, setCityInput] = useState(selectedCity);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, [selectedCity, dispatch]);

  const loadWeatherData = async () => {
    dispatch(fetchWeatherData(selectedCity));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
  };

  const handleCitySearch = () => {
    if (cityInput.trim()) {
      dispatch(setSelectedCity(cityInput.trim()));
      setShowSearch(false);
    }
  };

  const requestLocationPermission = async () => {
    if (isWeb) return true;

    const Geolocation = require('react-native-geolocation-service').default;

    if (Platform.OS === 'ios') {
      const granted = await Geolocation.requestAuthorization('whenInUse');
      return granted === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Weather App needs access to your location to show local weather',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  };

  const getLocationWeather = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature');
        return;
      }

      setRefreshing(true);

      const getPosition = () =>
        new Promise((resolve, reject) => {
          const geo = isWeb
            ? navigator.geolocation
            : require('react-native-geolocation-service').default;

          if (!geo) {
            reject(new Error('Geolocation not available'));
            return;
          }

          geo.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            }
          );
        });
      const position = await getPosition() as GeolocationPosition;
      const { latitude, longitude } = position.coords;
      const weatherData = await fetchWeatherByCoordinates(latitude, longitude);
      dispatch(setSelectedCity(weatherData.cityName));
    } catch (err) {
      Alert.alert('Error', 'Failed to get your location');
    } finally {
      setRefreshing(false);
    }
  };

  const renderWeatherInfo = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0066cc" />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWeatherData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!currentWeather) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.noDataText}>No weather data available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWeatherData}>
            <Text style={styles.retryButtonText}>Load Data</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.weatherContainer}>
        <Text style={styles.cityName}>{currentWeather.city}</Text>
        <View style={styles.tempContainer}>
          <Text style={styles.temperature}>{Math.round(currentWeather.temperature)}°</Text>
          <Text style={styles.weatherDesc}>{currentWeather.description}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="water-outline" size={24} color="#0066cc" />
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{currentWeather.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="speedometer-outline" size={24} color="#0066cc" />
            <Text style={styles.detailLabel}>Pressure</Text>
            <Text style={styles.detailValue}>{currentWeather.pressure} hPa</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="wind-outline" size={24} color="#0066cc" />
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>{currentWeather.wind_speed} m/s</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>
          Last updated: {new Date(currentWeather.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
        <View style={styles.actions}>
          {showSearch ? (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={cityInput}
                onChangeText={setCityInput}
                placeholder="Enter city name"
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleCitySearch}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={handleCitySearch}
              >
                <Icon name="search" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSearch(false)}
              >
                <Icon name="close" size={20} color="#0066cc" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowSearch(true)}
              >
                <Icon name="search" size={24} color="#0066cc" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={getLocationWeather}
              >
                <Icon name="location" size={24} color="#0066cc" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066cc']}
          />
        }
      >
        {renderWeatherInfo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#0066cc',
    padding: 9,
    marginLeft: 5,
    borderRadius: 5,
  },
  closeButton: {
    padding: 10,
    marginLeft: 5,
  },
  weatherContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tempContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '200',
    color: '#0066cc',
  },
  weatherDesc: {
    fontSize: 18,
    color: '#666',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;