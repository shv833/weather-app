import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Icon from 'react-native-vector-icons/Ionicons';
import { RouteProp } from '@react-navigation/native';

type WeatherDetailsRouteParams = {
  date?: string;
  time?: string;
};

type WeatherDetailsProps = {
  route: RouteProp<{ params: WeatherDetailsRouteParams }, 'params'>;
};

const WeatherDetailsScreen = ({ route }: WeatherDetailsProps) => {
  const { currentWeather } = useSelector((state: RootState) => state.weather);
  
  if (!currentWeather) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No weather data available</Text>
      </View>
    );
  }

  const dateTime = new Date(currentWeather.timestamp);
  const formattedDate = dateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = dateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cityName}>{currentWeather.city}</Text>
        <Text style={styles.dateTime}>{formattedDate} at {formattedTime}</Text>
        
        <View style={styles.tempContainer}>
          <Text style={styles.temperature}>{Math.round(currentWeather.temperature)}°</Text>
          <Text style={styles.description}>{currentWeather.description}</Text>
        </View>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Icon name="water-outline" size={28} color="#0066cc" />
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{currentWeather.humidity}%</Text>
            <Text style={styles.detailDescription}>Relative humidity in the air</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="speedometer-outline" size={28} color="#0066cc" />
            <Text style={styles.detailLabel}>Pressure</Text>
            <Text style={styles.detailValue}>{currentWeather.pressure} hPa</Text>
            <Text style={styles.detailDescription}>Atmospheric pressure</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="wind-outline" size={28} color="#0066cc" />
            <Text style={styles.detailLabel}>Wind Speed</Text>
            <Text style={styles.detailValue}>{currentWeather.wind_speed} m/s</Text>
            <Text style={styles.detailDescription}>Current wind velocity</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="thermometer-outline" size={28} color="#0066cc" />
            <Text style={styles.detailLabel}>Temperature</Text>
            <Text style={styles.detailValue}>{Math.round(currentWeather.temperature)}°C</Text>
            <Text style={styles.detailDescription}>Current air temperature</Text>
          </View>
        </View>
        
        <View style={styles.additionalInfo}>
          <Text style={styles.sectionTitle}>Weather Insights</Text>
          
          <View style={styles.insightItem}>
            <Icon name="eye-outline" size={20} color="#0066cc" />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Visibility</Text>
              <Text style={styles.insightDescription}>
                {currentWeather.humidity < 60 ? 'Good visibility expected' : 'Reduced visibility possible'}
              </Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <Icon name="shirt-outline" size={20} color="#0066cc" />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Clothing Recommendation</Text>
              <Text style={styles.insightDescription}>
                {currentWeather.temperature > 20 
                  ? 'Light clothing recommended' 
                  : currentWeather.temperature > 10 
                  ? 'Moderate clothing needed' 
                  : 'Warm clothing required'}
              </Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <Icon name="umbrella-outline" size={20} color="#0066cc" />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Rain Preparation</Text>
              <Text style={styles.insightDescription}>
                {currentWeather.description.toLowerCase().includes('rain') 
                  ? 'Umbrella recommended' 
                  : 'No rain expected'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  tempContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  temperature: {
    fontSize: 72,
    fontWeight: '200',
    color: '#0066cc',
  },
  description: {
    fontSize: 18,
    color: '#666',
    textTransform: 'capitalize',
    marginTop: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
});

export default WeatherDetailsScreen;