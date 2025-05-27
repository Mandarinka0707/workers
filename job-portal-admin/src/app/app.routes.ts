import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './components/admin/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [() => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return false;
      }
      return true;
    }]
  },
  { path: '**', redirectTo: '/login' }
];
