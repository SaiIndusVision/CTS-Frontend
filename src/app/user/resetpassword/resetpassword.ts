import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, ResetPasswordRequest, ResetPasswordResponse, ValidateResetTokenRequest, ValidateResetTokenResponse } from '../../service/api.service';
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
  selector: 'app-reset-password',
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
  templateUrl: './resetpassword.html',
  styleUrls: ['./resetpassword.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordData: ResetPasswordRequest = {
    token: '',
    new_password: '',
    confirm_password: ''
  };
  userId: string | null = null;
  errorMessage = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  isTokenValid = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      this.userId = params['user_id'];

      if (token && this.userId) {
        this.loading = true;
        const validateRequest: ValidateResetTokenRequest = { token };
        this.apiService.validateResetToken(validateRequest).subscribe({
          next: (response: ValidateResetTokenResponse) => {
            console.log('Validate token response:', response); // Debug log
            if (response.status === 200) {
              this.isTokenValid = true;
              this.resetPasswordData.token = token;
              console.log('Token validated successfully, userId:', this.userId); // Debug log
            } else {
              this.isTokenValid = false;
              this.errorMessage = response.message || 'Invalid or expired token';
              console.error('Token validation failed:', this.errorMessage, 'Response data:', response.data); // Debug log
              this.snackBar.open(this.errorMessage, 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
            }
            this.loading = false;
          },
          error: (err) => {
            this.isTokenValid = false;
            this.errorMessage = err.error?.message || 'Failed to validate token';
            console.error('Validate token error:', err); // Debug log
            this.snackBar.open(this.errorMessage, 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
            this.loading = false;
          },
          complete: () => (this.loading = false)
        });
      } else {
        this.isTokenValid = false;
        this.errorMessage = 'Invalid reset link: Missing token or user ID';
        console.error('Missing query params:', { token, userId: this.userId }); // Debug log
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePassword(): string | null {
  // Updated regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  if (!this.resetPasswordData.new_password) {
    return 'New password is required';
  }
  if (!passwordRegex.test(this.resetPasswordData.new_password)) {
    return 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
  if (!this.resetPasswordData.confirm_password) {
    return 'Confirm password is required';
  }
  if (this.resetPasswordData.new_password !== this.resetPasswordData.confirm_password) {
    return 'Passwords do not match';
  }
  return null;
}
passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;


  onSubmit(): void {
    if (!this.isTokenValid) {
      this.snackBar.open('Cannot reset password: Invalid or expired token', 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
      return;
    }
    if (!this.userId) {
      this.snackBar.open('User ID is missing', 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
      return;
    }
    const validationError = this.validatePassword();
    if (validationError) {
      this.errorMessage = validationError;
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.apiService.resetPassword(this.userId, this.resetPasswordData).subscribe({
      next: (response: ResetPasswordResponse) => {
        this.snackBar.open(response.message, 'Close', { duration: 5000, panelClass: ['bg-green-600', 'text-white'] });
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Password reset failed. Please try again.';
        console.error('Reset password error:', err); // Debug log
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}