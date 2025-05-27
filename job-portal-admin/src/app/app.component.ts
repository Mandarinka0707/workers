import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatToolbarModule, RouterModule],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary">
        <span>Job Portal Admin Panel</span>
      </mat-toolbar>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    mat-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }
    
    .content {
      margin-top: 64px;
      padding: 20px;
      flex: 1;
    }
  `]
})
export class AppComponent {
  title = 'job-portal-admin';
}
