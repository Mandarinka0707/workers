export interface Vacancy {
  id: number;
  employerId: number;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary: number;
  location: string;
  employmentType: string;
  company: string;
  status: string;
  skills: string[];
  education: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: number;
  vacancyId: number;
  resumeId: number;
  userId?: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  applicantName?: string;
  applicantEmail?: string;
  resume?: Resume | null;
}

export interface Resume {
  id: number;
  userId: number;
  title: string;
  description: string;
  experience: string;
  education: string;
  skills: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  role: 'employer' | 'jobseeker';
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse extends User {
  token: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
} 