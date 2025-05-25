import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider, useNotification } from './src/contexts/NotificationContext';
import NotificationService from './src/services/NotificationService';

const AppContent = () => {
  const { showNotification } = useNotification();

  useEffect(() => {
    NotificationService.setNotificationCallback(showNotification);
  }, [showNotification]);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;