export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  // Support for backend field names
  ID?: number;
  Name?: string;
  Email?: string;
  Role?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface Vacancy {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  requirements: string[];
  responsibilities: string;
  skills: string[];
  education: string;
  employmentType: string;
  status: 'active' | 'archived';
  employerId: number;
  createdAt: string;
  updatedAt: string;
  // Support for backend field names
  ID?: number;
  Title?: string;
  Description?: string;
  Company?: string;
  Location?: string;
  Salary?: string;
  Requirements?: string[];
  Responsibilities?: string;
  Skills?: string[];
  Education?: string;
  EmploymentType?: string;
  Status?: 'active' | 'archived';
  EmployerID?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface Resume {
  id: number;
  title: string;
  description: string;
  userId: number;
  skills: string[];
  education: string;
  experience: string;
  createdAt: string;
  updatedAt: string;
  // Support for backend field names
  ID?: number;
  Title?: string;
  Description?: string;
  UserID?: number;
  Skills?: string[];
  Education?: string;
  Experience?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface UserStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobseekers: number;
  totalVacancies: number;
  totalResumes: number;
  totalApplications: number;
} 