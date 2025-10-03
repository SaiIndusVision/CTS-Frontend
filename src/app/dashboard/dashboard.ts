import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../shared/header/header';
import { SidebarComponent } from '../shared/sidebar/sidebar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Added for error messages

interface User {
  id: number;
  name: string;
  email: string;
  role: number | null;
}

interface UsersResponse {
  message: string;
  status: number;
  count: number;
  next: string | null;
  previous: string | null;
  data: User[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule, // Added
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'role'];
  totalCount = 0;
  pageSize = 10;
  currentPage = 1;
  loading = false;
  errorMessage = ''; // Added for error display
  filters = {
    name: '',
    email: '',
    role: undefined as number | undefined
  };

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {} // Added MatSnackBar

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.errorMessage = ''; // Clear previous errors
    this.apiService.getUsers(this.currentPage, this.pageSize, this.filters).subscribe({
      next: (response: UsersResponse) => {
        this.users = response.data ? response.data : []; // Ensure users is an array
        this.totalCount = response.count || 0;
        this.loading = false;
      },
      error: (err) => {
        this.users = []; // Reset users to empty array on error
        this.totalCount = 0;
        this.errorMessage = err.error?.message || 'Failed to fetch users. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchUsers();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.fetchUsers();
  }
}