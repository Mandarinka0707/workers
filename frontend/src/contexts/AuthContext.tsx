import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.getProfile()
        .then((response) => {
          console.log('Profile response:', response);
          if (response && response.user?.id) {
            const userWithCorrectRole = {
              ...response.user,
              role: response.user.role as 'jobseeker' | 'employer'
            };
            setUser(userWithCorrectRole);
          }
        })
        .catch((error) => {
          console.error('Error fetching profile:', error);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt with:', { email });
      const response = await auth.login(email, password);
      console.log('Raw login response:', response);
      
      // Проверяем структуру ответа
      if (!response) {
        console.error('Empty response from server');
        throw new Error('Empty response from server');
      }

      console.log('Response structure:', {
        hasToken: !!response.token,
        hasId: !!response.id,
        hasEmail: !!response.email,
        hasName: !!response.name,
        hasRole: !!response.role,
        fullResponse: response
      });

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
        const profileResponse = await auth.getProfile();
        console.log('Profile response:', profileResponse);

        if (!profileResponse || !profileResponse.id) {
          throw new Error('Failed to fetch user profile');
        }

        const userWithCorrectRole: User = {
          id: profileResponse.id,
          email: profileResponse.email,
          name: profileResponse.name,
          role: profileResponse.role as 'jobseeker' | 'employer',
          createdAt: profileResponse.createdAt,
          updatedAt: profileResponse.updatedAt || profileResponse.createdAt
        };

        console.log('Setting user from profile:', userWithCorrectRole);
        setUser(userWithCorrectRole);
      } else {
        // Используем данные из ответа на вход
        const userWithCorrectRole: User = {
          id: response.id,
          email: response.email,
          name: response.name,
          role: response.role as 'jobseeker' | 'employer',
          createdAt: response.createdAt,
          updatedAt: response.updatedAt || response.createdAt
        };

        console.log('Setting user from login response:', userWithCorrectRole);
        setUser(userWithCorrectRole);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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