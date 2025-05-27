import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../services/admin.service';
import { User, Vacancy, Resume, UserStats } from '../../../interfaces';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  providers: [AdminService],
  template: `
    <div class="admin-dashboard">
      <div class="admin-header">
        <h1>Job Portal Admin Panel</h1>
      </div>

      <div *ngIf="loading" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading" class="content">
        <!-- Stats Cards -->
        <div class="stats-cards">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon users">
                <div class="circle"></div>
              </div>
              <div class="stat-info">
                <h3>Users</h3>
                <p>{{users.length}}</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon vacancies">
                <div class="circle"></div>
              </div>
              <div class="stat-info">
                <h3>Vacancies</h3>
                <p>{{vacancies.length}}</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon resumes">
                <div class="circle"></div>
              </div>
              <div class="stat-info">
                <h3>Resumes</h3>
                <p>{{resumes.length}}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Main Content -->
        <mat-tab-group>
          <!-- Users Tab -->
          <mat-tab label="Users">
            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Users Management</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="usersDataSource" class="mat-elevation-z8">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef>ID</th>
                    <td mat-cell *matCellDef="let user">{{user.id}}</td>
                  </ng-container>

                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let user">{{user.name}}</td>
                  </ng-container>

                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let user">{{user.email}}</td>
                  </ng-container>

                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef>Role</th>
                    <td mat-cell *matCellDef="let user">
                      <span class="role-badge" [class]="user.role">{{user.role}}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let user">
                      <button mat-button 
                              class="delete-button" 
                              (click)="deleteUser(user.id)" 
                              matTooltip="Delete user"
                              matTooltipPosition="above">
                        УДАЛИТЬ
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['id', 'name', 'email', 'role', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['id', 'name', 'email', 'role', 'actions'];"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Vacancies Tab -->
          <mat-tab label="Vacancies">
            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Vacancies Management</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="vacanciesDataSource" class="mat-elevation-z8">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef>ID</th>
                    <td mat-cell *matCellDef="let vacancy">{{vacancy.id}}</td>
                  </ng-container>

                  <ng-container matColumnDef="title">
                    <th mat-header-cell *matHeaderCellDef>Title</th>
                    <td mat-cell *matCellDef="let vacancy">{{vacancy.title}}</td>
                  </ng-container>

                  <ng-container matColumnDef="company">
                    <th mat-header-cell *matHeaderCellDef>Company</th>
                    <td mat-cell *matCellDef="let vacancy">{{vacancy.company}}</td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let vacancy">
                      <span class="status-badge" [class]="vacancy.status">{{vacancy.status}}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let vacancy">
                      <button mat-button 
                              class="delete-button" 
                              (click)="deleteVacancy(vacancy.id)" 
                              matTooltip="Delete vacancy"
                              matTooltipPosition="above">
                        УДАЛИТЬ
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['id', 'title', 'company', 'status', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['id', 'title', 'company', 'status', 'actions'];"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Resumes Tab -->
          <mat-tab label="Resumes">
            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Resumes Management</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="resumesDataSource" class="mat-elevation-z8">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef>ID</th>
                    <td mat-cell *matCellDef="let resume">{{resume.id}}</td>
                  </ng-container>

                  <ng-container matColumnDef="title">
                    <th mat-header-cell *matHeaderCellDef>Title</th>
                    <td mat-cell *matCellDef="let resume">{{resume.title}}</td>
                  </ng-container>

                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef>User</th>
                    <td mat-cell *matCellDef="let resume">{{resume.userId}}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let resume">
                      <button mat-button 
                              class="delete-button" 
                              (click)="deleteResume(resume.id)" 
                              matTooltip="Delete resume"
                              matTooltipPosition="above">
                        УДАЛИТЬ
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['id', 'title', 'user', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['id', 'title', 'user', 'actions'];"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
      padding-top: 80px;
    }

    .admin-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: white;
      padding: 16px 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1000;

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #333;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-5px);
      }
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      .circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }

      &.users .circle {
        background-color: #2196f3;
      }

      &.vacancies .circle {
        background-color: #4caf50;
      }

      &.resumes .circle {
        background-color: #ff9800;
      }
    }

    .stat-info {
      h3 {
        margin: 0;
        font-size: 16px;
        color: #666;
      }

      p {
        margin: 4px 0 0;
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
    }

    .table-card {
      margin-top: 20px;
      border-radius: 8px;
      overflow: hidden;
    }

    table {
      width: 100%;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .mat-column-actions {
      width: 100px;
      text-align: center;
    }

    .mat-column-id {
      width: 80px;
    }

    .mat-column-role {
      width: 120px;
    }

    .role-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;

      &.admin {
        background-color: #f44336;
        color: white;
      }

      &.employer {
        background-color: #2196f3;
        color: white;
      }

      &.jobseeker {
        background-color: #4caf50;
        color: white;
      }
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;

      &.active {
        background-color: #4caf50;
        color: white;
      }

      &.archived {
        background-color: #9e9e9e;
        color: white;
      }
    }

    .delete-button {
      transition: all 0.3s ease;
      background-color: transparent;
      color: #757575;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &:hover {
        background-color: #f44336;
        color: white;
        border-color: #f44336;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2);
      }
    }

    ::ng-deep .mat-tooltip {
      font-size: 12px;
      padding: 4px 8px;
      background-color: rgba(97, 97, 97, 0.9);
    }

    ::ng-deep .mat-tab-group {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
    }

    ::ng-deep .mat-tab-header {
      margin-bottom: 20px;
    }

    ::ng-deep .mat-tab-label {
      font-size: 16px;
      font-weight: 500;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  vacancies: Vacancy[] = [];
  resumes: Resume[] = [];
  loading = true;
  error: string | null = null;

  usersDataSource = new MatTableDataSource<User>([]);
  vacanciesDataSource = new MatTableDataSource<Vacancy>([]);
  resumesDataSource = new MatTableDataSource<Resume>([]);

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('AdminDashboardComponent: Initializing component');
    this.loadData();
  }

  async loadData(): Promise<void> {
    console.log('AdminDashboardComponent: Starting to load data');
    this.loading = true;
    try {
      console.log('AdminDashboardComponent: Fetching users, vacancies, and resumes');
      const [users, vacancies, resumes] = await Promise.all([
        firstValueFrom(this.adminService.getAllUsers()),
        firstValueFrom(this.adminService.getAllVacancies()),
        firstValueFrom(this.adminService.getAllResumes())
      ]);
      console.log('AdminDashboardComponent: Received data:', { users, vacancies, resumes });

      // Transform data to match interface
      this.users = (users || []).map(user => ({
        id: user.ID || user.id,
        name: user.Name || user.name,
        email: user.Email || user.email,
        role: user.Role || user.role
      }));

      this.vacancies = (vacancies || []).map(vacancy => ({
        id: vacancy.ID || vacancy.id,
        title: vacancy.Title || vacancy.title,
        description: vacancy.Description || vacancy.description,
        company: vacancy.Company || vacancy.company,
        location: vacancy.Location || vacancy.location,
        salary: vacancy.Salary || vacancy.salary,
        requirements: vacancy.Requirements || vacancy.requirements,
        responsibilities: vacancy.Responsibilities || vacancy.responsibilities,
        skills: vacancy.Skills || vacancy.skills || [],
        education: vacancy.Education || vacancy.education,
        employmentType: vacancy.EmploymentType || vacancy.employmentType,
        status: vacancy.Status || vacancy.status,
        employerId: vacancy.EmployerID || vacancy.employerId,
        createdAt: vacancy.CreatedAt || vacancy.createdAt,
        updatedAt: vacancy.UpdatedAt || vacancy.updatedAt
      }));

      this.resumes = (resumes || []).map(resume => ({
        id: resume.ID || resume.id,
        title: resume.Title || resume.title,
        description: resume.Description || resume.description,
        userId: resume.UserID || resume.userId,
        skills: resume.Skills || resume.skills || [],
        education: resume.Education || resume.education,
        experience: resume.Experience || resume.experience,
        createdAt: resume.CreatedAt || resume.createdAt,
        updatedAt: resume.UpdatedAt || resume.updatedAt
      }));

      // Update data sources
      this.usersDataSource.data = this.users;
      this.vacanciesDataSource.data = this.vacancies;
      this.resumesDataSource.data = this.resumes;

      console.log('AdminDashboardComponent: Updated component state:', {
        usersCount: this.users.length,
        vacanciesCount: this.vacancies.length,
        resumesCount: this.resumes.length
      });
    } catch (error) {
      console.error('AdminDashboardComponent: Error loading data:', error);
      this.error = 'Failed to load data';
      this.showSnackBar('Failed to load data', 'error');
    } finally {
      this.loading = false;
      console.log('AdminDashboardComponent: Finished loading data');
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== userId);
          this.usersDataSource.data = this.users;
          this.showSnackBar('User deleted successfully', 'success');
        },
        error: (error: Error) => {
          console.error('Error deleting user:', error);
          this.error = 'Failed to delete user';
          this.showSnackBar('Failed to delete user', 'error');
        }
      });
    }
  }

  deleteVacancy(vacancyId: number): void {
    if (confirm('Are you sure you want to delete this vacancy?')) {
      this.adminService.deleteVacancy(vacancyId).subscribe({
        next: () => {
          this.vacancies = this.vacancies.filter(vacancy => vacancy.id !== vacancyId);
          this.vacanciesDataSource.data = this.vacancies;
          this.showSnackBar('Vacancy deleted successfully', 'success');
        },
        error: (error: Error) => {
          console.error('Error deleting vacancy:', error);
          this.error = 'Failed to delete vacancy';
          this.showSnackBar('Failed to delete vacancy', 'error');
        }
      });
    }
  }

  deleteResume(resumeId: number): void {
    if (confirm('Are you sure you want to delete this resume?')) {
      this.adminService.deleteResume(resumeId).subscribe({
        next: () => {
          this.resumes = this.resumes.filter(resume => resume.id !== resumeId);
          this.resumesDataSource.data = this.resumes;
          this.showSnackBar('Resume deleted successfully', 'success');
        },
        error: (error: Error) => {
          console.error('Error deleting resume:', error);
          this.error = 'Failed to delete resume';
          this.showSnackBar('Failed to delete resume', 'error');
        }
      });
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
} 