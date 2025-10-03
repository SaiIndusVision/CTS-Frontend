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
    user_id: 0, // Initialize user_id
    token: '',
    new_password: '',
    confirm_password: ''
  };
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
      const userId = params['user_id'];

      if (token && userId) {
        this.loading = true;
        const validateRequest: ValidateResetTokenRequest = { token };
        this.apiService.validateResetToken(validateRequest).subscribe({
          next: (response: ValidateResetTokenResponse) => {
            if (response.status === 200 && response.data.user_id.toString() === userId) {
              this.isTokenValid = true;
              this.resetPasswordData.token = token;
              this.resetPasswordData.user_id = +userId; // Convert string to number
            } else {
              this.errorMessage = response.message || 'Invalid or expired token';
              this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
            }
            this.loading = false;
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Failed to validate token';
            this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
            this.loading = false;
          },
          complete: () => (this.loading = false)
        });
      } else {
        this.errorMessage = 'Invalid reset link';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePassword(): boolean {
    if (this.resetPasswordData.new_password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return false;
    }
    if (this.resetPasswordData.new_password !== this.resetPasswordData.confirm_password) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }
    return true;
  }

  onSubmit(): void {
    if (!this.isTokenValid) {
      this.snackBar.open('Cannot reset password: Invalid or expired token', 'Close', { duration: 5000 });
      return;
    }
    if (!this.validatePassword()) {
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.apiService.resetPassword(this.resetPasswordData).subscribe({
      next: (response: ResetPasswordResponse) => {
        this.snackBar.open(response.message, 'Close', { duration: 5000 });
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Password reset failed. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}