import axios from 'axios';
import { AuthResponse, User, Vacancy, Application } from '../types';

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
    console.log('Making request to:', config.url, {
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request:', {
        url: config.url,
        token: token.substring(0, 10) + '...'
      });
    } else {
      console.log('No token found for request:', config.url);
    }
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
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
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
    console.log('Login API response:', response.data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    console.log('Fetching user profile...');
    try {
      const response = await api.get<User>('/users/me');
      console.log('Profile API response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
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
    userId: data.UserID || data.userId || data.user_id,
    title: data.Title || data.title,
    description: data.Description || data.description,
    skills: data.Skills || data.skills || [],
    experience: data.Experience || data.experience,
    education: data.Education || data.education,
    status: data.Status || data.status,
    createdAt: data.CreatedAt || data.createdAt || data.created_at,
    updatedAt: data.UpdatedAt || data.updatedAt || data.updated_at
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

  delete: async (id: number) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  }
};

const transformApplication = (data: any): Application => {
  return {
    id: Number(data.id || data.ID),
    user_id: Number(data.user_id || data.userId || data.UserID),
    vacancy_id: Number(data.vacancy_id || data.vacancyId || data.VacancyID),
    resume_id: Number(data.resume_id || data.resumeId || data.ResumeID),
    status: data.status || data.Status,
    created_at: data.created_at || data.createdAt || data.CreatedAt,
    updated_at: data.updated_at || data.updatedAt || data.UpdatedAt,
    applicant_name: data.applicant_name || data.applicantName || data.ApplicantName,
    applicant_email: data.applicant_email || data.applicantEmail || data.ApplicantEmail
  };
};

export const applications = {
  getAll: async (params?: any) => {
    console.log('Fetching applications with params:', params);
    try {
      const token = localStorage.getItem('token');
      console.log('Current auth token:', token ? 'exists' : 'missing');
      
      // Формируем параметры запроса
      const queryParams: any = {};
      
      if (params?.employer_id) {
        queryParams.employer_id = params.employer_id;
      }
      
      if (params?.vacancy_ids) {
        // Преобразуем строку с ID в массив и обратно в строку для правильного форматирования
        const ids = params.vacancy_ids.split(',').map((id: string) => id.trim());
        queryParams.vacancy_ids = ids.join(',');
      }
      
      console.log('Request params:', queryParams);
      console.log('Request URL:', `${API_URL}/applications`);
      console.log('Full request URL with params:', `${API_URL}/applications?${new URLSearchParams(queryParams).toString()}`);
      
      const response = await api.get('/applications', { 
        params: queryParams,
        paramsSerializer: (params) => {
          return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
            .join('&');
        }
      });
      
      // Подробное логирование ответа
      console.log('Applications API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        request: {
          url: response.config.url,
          method: response.config.method,
          params: response.config.params,
          headers: response.config.headers
        }
      });
      
      // Проверяем, что response.data существует
      if (!response.data) {
        console.warn('No data in applications response');
        return [];
      }

      // Если данные пришли в виде массива, возвращаем их
      if (Array.isArray(response.data)) {
        console.log('Applications data is array, length:', response.data.length);
        if (response.data.length === 0) {
          console.log('Empty applications array received');
        } else {
          console.log('First application in array:', response.data[0]);
        }
        return response.data.map(transformApplication);
      }

      // Если данные пришли в виде объекта, проверяем наличие массива applications
      if (response.data.applications && Array.isArray(response.data.applications)) {
        console.log('Applications found in response.data.applications, length:', response.data.applications.length);
        if (response.data.applications.length === 0) {
          console.log('Empty applications array in response.data.applications');
        } else {
          console.log('First application in response.data.applications:', response.data.applications[0]);
        }
        return response.data.applications.map(transformApplication);
      }

      // Если данные пришли в виде объекта с полем data
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Applications found in response.data.data, length:', response.data.data.length);
        if (response.data.data.length === 0) {
          console.log('Empty applications array in response.data.data');
        } else {
          console.log('First application in response.data.data:', response.data.data[0]);
        }
        return response.data.data.map(transformApplication);
      }

      // Если данные пришли в виде объекта с полем items
      if (response.data.items && Array.isArray(response.data.items)) {
        console.log('Applications found in response.data.items, length:', response.data.items.length);
        if (response.data.items.length === 0) {
          console.log('Empty applications array in response.data.items');
        } else {
          console.log('First application in response.data.items:', response.data.items[0]);
        }
        return response.data.items.map(transformApplication);
      }

      console.warn('Unexpected response format:', response.data);
      return [];
    } catch (error: any) {
      console.error('Error fetching applications:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  getById: async (id: number) => {
    const response = await api.get(`/applications/${id}`);
    return transformApplication(response.data);
  },

  create: async (data: any) => {
    console.log('Creating application with data:', data);
    try {
      const response = await api.post('/applications', data);
      console.log('Application creation response:', response.data);
      return transformApplication(response.data);
    } catch (error: any) {
      console.error('Error creating application:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/applications/${id}`, data);
    return transformApplication(response.data);
  },

  updateStatus: async (id: number, status: 'pending' | 'accepted' | 'rejected'): Promise<Application> => {
    const response = await api.put(`/applications/${id}/status`, { status });
    return transformApplication(response.data);
  }
};

export default api;