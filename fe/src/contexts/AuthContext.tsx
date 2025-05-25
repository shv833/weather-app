import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register, checkToken } from '../api/authApi';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        if (token) {
          const userData = await checkToken(token);
          setState({
            isAuthenticated: true,
            user: userData,
            token,
            loading: false,
            error: null,
          });
        } else {
          setState({
            ...state,
            loading: false,
          });
        }
      } catch (error) {
        await AsyncStorage.removeItem('access_token');
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: 'Session expired. Please login again.',
        });
      }
    };

    loadToken();
  }, []);

  const loginUser = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const response = await login(email, password);
      
      const token = response.access_token || response.token;
      const user = response.user || { email };
      
      await AsyncStorage.setItem('access_token', token);
      
      setState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  const registerUser = async (username: string, email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const userData = await register(username, email, password);
      
      await loginUser(email, password);
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    await AsyncStorage.removeItem('access_token');
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        login: loginUser,
        register: registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};