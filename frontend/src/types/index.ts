export interface Vacancy {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string;
  salary: string;
  location: string;
  employmentType: string;
  company: string;
  status: 'active' | 'archived';
  skills: string[];
  education: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: number;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  experience: string;
  education: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employer' | 'jobseeker';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  email: string;
  name: string;
  role: 'employer' | 'jobseeker';
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: number;
  user_id: number;
  vacancy_id: number;
  resume_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  applicant_name?: string;
  applicant_email?: string;
} 