import axios from 'axios';
import { Resume } from './types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for logging and adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url, 'with config:', config);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('Received response:', response);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const resumes = {
  getAll: async (): Promise<Resume[]> => {
    try {
      console.log('Fetching all resumes...');
      const response = await api.get('/resumes/my');
      console.log('Resumes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
      }
      throw error;
    }
  },

  get: async (id: number): Promise<Resume> => {
    try {
      const response = await api.get(`/resumes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  },

  create: async (resume: Omit<Resume, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Resume> => {
    try {
      const response = await api.post('/resumes', resume);
      return response.data;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  },

  update: async (id: number, resume: Partial<Resume>): Promise<Resume> => {
    try {
      const response = await api.put(`/resumes/${id}`, resume);
      return response.data;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/resumes/${id}`);
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }
}; 