import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, LoginRequest, LoginResponse } from '../../service/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  errorMessage = '';
  loading = false;
  showPassword = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.login(this.loginData).subscribe({
      next: (response: LoginResponse) => {
        this.apiService.handleLoginSuccess(response);
        this.snackBar.open(response.message, 'Close', { duration: 5000 });
        this.loading = false;
        // Redirect based on role
        const role = response.data.role_name;
        if (role === 'User') {
          this.router.navigate(['/user-slot']);
        } else if (role === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else {
          // Fallback in case role is not recognized
          this.router.navigate(['/login']);
          this.snackBar.open('Unknown role, redirecting to dashboard', 'Close', { duration: 5000 });
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}