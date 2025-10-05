import { Component, OnInit } from '@angular/core';
import { ApiService, DashboardResponse } from '../service/api.service';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../shared/header/header';
import { SidebarComponent } from '../shared/sidebar/sidebar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = null; // Changed to any to handle nested structure
  loading = false;
  errorMessage = '';

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getDashboard().subscribe({
      next: (response: any) => {
        console.log('Dashboard Response:', response);
        // Extract the actual data from the response
        this.dashboardData = response.data || response;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load dashboard data. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['bg-red-600', 'text-white']
        });
        this.loading = false;
      }
    });
  }

  // Helper methods to safely check array lengths
  hasRecentBookings(): boolean {
    return !!(this.dashboardData?.recent_bookings && this.dashboardData.recent_bookings.length > 0);
  }

  hasRecentSlots(): boolean {
    return !!(this.dashboardData?.recent_slots && this.dashboardData.recent_slots.length > 0);
  }

  hasRecentCategories(): boolean {
    return !!(this.dashboardData?.recent_categories && this.dashboardData.recent_categories.length > 0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}