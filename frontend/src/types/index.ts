export interface User {
  id: number;
  email: string;
  name: string;
  role: 'jobseeker' | 'employer';
  createdAt: string;
  updatedAt: string;
}

export interface JobSeeker {
  id: number;
  userId: number;
  user: User;
  skills: string[];
  experience: string;
  education: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employer {
  id: number;
  userId: number;
  user: User;
  company: string;
  position: string;
  createdAt: string;
  updatedAt: string;
}

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
  status: 'active' | 'closed';
  skills: string[];
  education: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: number;
  user_id: number;
  title: string;
  description: string;
  skills: string[];
  experience: string;
  education: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  vacancyId: number;
  resumeId: number;
  status: 'pending' | 'accepted' | 'rejected';
  applicantName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token?: string;
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  status: number;
} 