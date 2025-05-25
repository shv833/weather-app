import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchForecastData } from '../redux/weatherSlice';
import { RootState, AppDispatch } from '../redux/store';
import { ForecastItem } from '../types/weather';
import Icon from 'react-native-vector-icons/Ionicons';

const groupForecastByDay = (forecastList: ForecastItem[]) => {
  const grouped = forecastList.reduce((acc: Record<string, ForecastItem[]>, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});
  
  return Object.entries(grouped).map(([date, items]) => ({
    date,
    items,
    avgTemp: Math.round(items.reduce((sum, item) => sum + item.temperature, 0) / items.length),
    icon: items[0].icon,
    description: items[0].description,
  }));
};

const ForecastScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { forecast, selectedCity, loading, error } = useSelector(
    (state: RootState) => state.weather
  );
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    loadForecastData();
  }, [selectedCity, dispatch]);

  const loadForecastData = async () => {
    dispatch(fetchForecastData(selectedCity));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadForecastData();
    setRefreshing(false);
  };

  const toggleDayExpansion = (date: string) => {
    if (expandedDay === date) {
      setExpandedDay(null);
    } else {
      setExpandedDay(date);
    }
  };

  const renderDayForecast = ({ item }: { item: any }) => {
    const isExpanded = expandedDay === item.date;
    
    return (
      <TouchableOpacity
        style={styles.dayContainer}
        onPress={() => toggleDayExpansion(item.date)}
        activeOpacity={0.7}
      >
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderLeft}>
            <Text style={styles.dayDate}>
              {new Date(item.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={styles.dayDescription}>{item.description}</Text>
          </View>
          
          <View style={styles.dayHeaderRight}>
            <Text style={styles.dayTemp}>{item.avgTemp}°</Text>
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#0066cc" />
          </View>
        </View>
        
        {isExpanded && (
          <View style={styles.hourlyContainer}>
            <FlatList
              data={item.items}
              keyExtractor={(item) => `${item.date}-${item.time}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: hourItem }) => (
                <View style={styles.hourlyItem}>
                  <Text style={styles.hourlyTime}>{hourItem.time}</Text>
                  <Text style={styles.hourlyTemp}>{Math.round(hourItem.temperature)}°</Text>
                  <View style={styles.hourlyDetails}>
                    <View style={styles.hourlyDetailItem}>
                      <Icon name="water-outline" size={14} color="#0066cc" />
                      <Text style={styles.hourlyDetailText}>{hourItem.humidity}%</Text>
                    </View>
                    <View style={styles.hourlyDetailItem}>
                      <Icon name="wind-outline" size={14} color="#0066cc" />
                      <Text style={styles.hourlyDetailText}>{hourItem.wind_speed} m/s</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !forecast) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error && !forecast) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadForecastData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupedForecast = forecast?.list ? groupForecastByDay(forecast.list) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>5-Day Forecast</Text>
        <Text style={styles.subtitle}>{selectedCity}</Text>
      </View>
      
      <FlatList
        data={groupedForecast}
        keyExtractor={(item) => item.date}
        renderItem={renderDayForecast}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066cc']}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  dayContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  dayTemp: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066cc',
    marginRight: 8,
  },
  hourlyContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 12,
  },
  hourlyItem: {
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    width: 80,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  hourlyTime: {
    fontSize: 14,
    color: '#666',
  },
  hourlyTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  hourlyDetails: {
    width: '100%',
  },
  hourlyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hourlyDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default ForecastScreen;