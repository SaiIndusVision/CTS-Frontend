import { Component, OnInit } from '@angular/core';
import { ApiService, Role, UsersResponse } from '../../service/api.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../shared/header/header';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

interface User {
  id: number;
  name: string;
  email: string;
  role: number | null;
  role_name: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    HeaderComponent,
    SidebarComponent,
    RouterModule
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'role'];
  totalCount = 0;
  pageSize = 10;
  currentPage = 1;
  loading = false;
  errorMessage = '';
  roles: Role[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  loadingCard: number | null = null;

  filters = {
    name: '',
    email: '',
    role: undefined as number | undefined
  };

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.getRoles().subscribe({
      next: (response) => {
        this.roles = response.data.filter(role => role.is_active);
        this.fetchUsers();
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch roles. Using default role names.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.fetchUsers();
      }
    });
  }

  fetchUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.apiService.getUsers(this.currentPage, this.pageSize, this.filters).subscribe({
      next: (response: UsersResponse) => {
        this.users = response.data.map(user => ({
          ...user,
          role_name: this.getRoleNameById(user.role)
        }));
        this.totalCount = response.count || 0;
        this.loading = false;
      },
      error: (err) => {
        this.users = [];
        this.totalCount = 0;
        this.errorMessage = err.error?.message || 'Failed to fetch users. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  getRoleNameById(roleId: number | null): string {
    if (roleId === null) return 'Unassigned';
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
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

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  onCardClick(userId: number): void {
    if (!userId || isNaN(userId)) {
      this.errorMessage = 'Invalid user ID provided.';
      this.snackBar.open(this.errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['bg-red-600', 'text-white']
      });
      return;
    }

    this.loadingCard = userId;
    try {
      const encryptedUserId = this.apiService.encryptUserId(userId);
      console.log('Encrypting userId:', userId, '->', encryptedUserId);
      this.router.navigate(['/bookings', encryptedUserId]).then(success => {
        this.loadingCard = null;
        if (!success) {
          console.error('Navigation failed for encrypted userId:', encryptedUserId);
          this.errorMessage = 'Navigation failed. Please try again.';
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['bg-red-600', 'text-white']
          });
        }
      });
    } catch (error) {
      console.error('Encryption error in onCardClick:', error, 'userId:', userId);
      this.loadingCard = null;
      this.errorMessage = 'Failed to encrypt user ID. Please try again.';
      this.snackBar.open(this.errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['bg-red-600', 'text-white']
      });
    }
  }
}