import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Vacancy, Resume, UserStats } from '../interfaces';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/v1/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  getAllVacancies(): Observable<Vacancy[]> {
    console.log('AdminService: Fetching all vacancies');
    const headers = this.getHeaders();
    console.log('AdminService: Using headers:', headers);
    return this.http.get<Vacancy[]>(`${this.apiUrl}/vacancies`, { headers }).pipe(
      tap({
        next: (vacancies) => console.log('AdminService: Received vacancies:', vacancies),
        error: (error) => console.error('AdminService: Error fetching vacancies:', error)
      })
    );
  }

  getAllResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${this.apiUrl}/resumes`, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  deleteVacancy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vacancies/${id}`, { headers: this.getHeaders() });
  }

  deleteResume(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/resumes/${id}`, { headers: this.getHeaders() });
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats/users`, { headers: this.getHeaders() });
  }
} 