import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types/index';
import { auth } from '../services/api';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'jobseeker' | 'employer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await auth.getProfile();
      console.log('Profile response:', response);

      if (response && response.id) {
        console.log('User role from profile:', response.role);
        const userWithCorrectRole: User = {
          id: response.id,
          email: response.email,
          name: response.name,
          role: response.role as 'jobseeker' | 'employer',
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        };
        console.log('Setting user from profile:', userWithCorrectRole);
        setUser(userWithCorrectRole);
        localStorage.setItem('user', JSON.stringify(userWithCorrectRole));
      } else {
        console.error('Invalid profile response:', response);
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Login attempt with:', { email });
      const response = await auth.login(email, password);
      console.log('Raw login response:', response);
      
      if (!response) {
        console.error('Empty response from server');
        throw new Error('Empty response from server');
      }

      if (response.token) {
        localStorage.setItem('token', response.token);
        console.log('Token saved to localStorage');
      } else {
        console.error('No token in response');
        throw new Error('No token in response');
      }

      // Если в ответе нет данных пользователя, получаем их отдельно
      if (!response.id) {
        console.log('No user data in login response, fetching profile...');
        await fetchUserProfile();
      } else {
        // Используем данные из ответа на вход
        console.log('User role from login response:', response.role);
        const userWithCorrectRole: User = {
          id: response.id,
          email: response.email,
          name: response.name,
          role: response.role as 'jobseeker' | 'employer',
          createdAt: response.createdAt || '',
          updatedAt: response.updatedAt || ''
        };

        console.log('Setting user from login response:', userWithCorrectRole);
        setUser(userWithCorrectRole);
        localStorage.setItem('user', JSON.stringify(userWithCorrectRole));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('Registration attempt with data:', data);
      const response = await auth.register(data);
      console.log('Registration response:', response);

      if (!response || !response.id) {
        throw new Error('Invalid server response: missing user data');
      }

      // После успешной регистрации выполняем вход
      await login(data.email, data.password);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response) {
        throw new Error(error.response.data.error || 'Registration failed');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error('Error setting up the request');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 