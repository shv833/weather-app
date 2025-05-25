import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    console.log('handleLogout called');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('Logging out...');
            logout();
          },
        },
      ]
    );    
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
    
    if (value) {
      Alert.alert('Notifications Enabled', 'You will receive weather alerts and updates.');
    } else {
      Alert.alert('Notifications Disabled', 'You will not receive weather notifications.');
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    setLocationEnabled(value);
    await AsyncStorage.setItem('locationEnabled', JSON.stringify(value));
    
    if (value) {
      Alert.alert('Location Enabled', 'The app can access your location for local weather.');
    } else {
      Alert.alert('Location Disabled', 'Manual city selection will be required.');
    }
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached weather data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('cachedWeatherData');
              await AsyncStorage.removeItem('cachedForecastData');
              Alert.alert('Success', 'Cache cleared successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache.');
            }
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About Weather App',
      'Version 1.0.0\n\nThis app provides real-time weather information and forecasts using data from reliable weather APIs.\n\nBuilt with React Native and FastAPI.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color="#0066cc" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="notifications-outline" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive weather alerts and updates
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#ccc', true: '#0066cc' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="location-outline" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDescription}>
                Allow access to your location for local weather
              </Text>
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={handleLocationToggle}
            trackColor={{ false: '#ccc', true: '#0066cc' }}
            thumbColor={locationEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={clearCache}>
          <View style={styles.settingInfo}>
            <Icon name="trash-outline" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Clear Cache</Text>
              <Text style={styles.settingDescription}>
                Remove cached weather data
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={showAbout}>
          <View style={styles.settingInfo}>
            <Icon name="information-circle-outline" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>About</Text>
              <Text style={styles.settingDescription}>
                App version and information
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => Alert.alert('Contact', 'Email: support@weatherapp.com')}
        >
          <View style={styles.settingInfo}>
            <Icon name="mail-outline" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Contact Support</Text>
              <Text style={styles.settingDescription}>
                Get help and report issues
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
        }}
      >
        <Icon name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4444',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen;
