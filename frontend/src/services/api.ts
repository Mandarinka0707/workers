import axios from 'axios';
import { AuthResponse, ApiError, User, Vacancy, Application } from '../types';

// Use a default URL if environment variable is not set
const API_URL = 'http://localhost:8080/api/v1';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'jobseeker' | 'employer';
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`,
      role: data.role
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
  }
};

export const vacancies = {
  getAll: async (params?: any) => {
    const response = await api.get('/vacancies', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/vacancies/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    console.log('Creating vacancy with data:', data);
    try {
      const response = await api.post('/vacancies', data);
      console.log('Vacancy creation response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Vacancy creation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    console.log('Updating vacancy with data:', { id, data });
    try {
      const response = await api.put(`/vacancies/${id}`, data);
      console.log('Vacancy update response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Vacancy update error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  delete: async (id: string) => {
    const response = await api.delete(`/vacancies/${id}`);
    return response.data;
  }
};

const transformResumeData = (data: any) => {
  return {
    id: data.ID || data.id,
    user_id: data.UserID || data.user_id,
    title: data.Title || data.title,
    description: data.Description || data.description,
    skills: data.Skills || data.skills || [],
    experience: data.Experience || data.experience,
    education: data.Education || data.education,
    status: data.Status || data.status,
    created_at: data.CreatedAt || data.created_at,
    updated_at: data.UpdatedAt || data.updated_at
  };
};

export const resumes = {
  getAll: async (params?: any) => {
    console.log('Fetching resumes with params:', params);
    try {
      const response = await api.get('/resumes', { params });
      console.log('Resumes response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      return Array.isArray(response.data) 
        ? response.data.map(transformResumeData)
        : response.data;
    } catch (error: any) {
      console.error('Error fetching resumes:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  getById: async (id: string) => {
    console.log('Fetching resume by ID:', id);
    try {
      const response = await api.get(`/resumes/${id}`);
      console.log('Resume response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      return transformResumeData(response.data);
    } catch (error: any) {
      console.error('Error fetching resume:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  create: async (data: any) => {
    const response = await api.post('/resumes', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/resumes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  }
};

export const applications = {
  getAll: async (params?: any) => {
    console.log('Fetching applications with params:', params);
    try {
      const response = await api.get('/applications', { params });
      console.log('Applications response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching applications:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  getById: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/applications/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: 'pending' | 'accepted' | 'rejected'): Promise<Application> => {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  }
};

export default api; 