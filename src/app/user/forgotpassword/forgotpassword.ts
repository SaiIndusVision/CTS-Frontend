import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, ForgotPasswordRequest, ForgotPasswordResponse } from '../../service/api.service';
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
  selector: 'app-forgot-password',
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
  templateUrl: './forgotpassword.html',
  styleUrls: ['./forgotpassword.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordData: ForgotPasswordRequest = { email: '' };
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private apiService: ApiService, private router: Router, private snackBar: MatSnackBar) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.forgotPassword(this.forgotPasswordData).subscribe({
      next: (response: ForgotPasswordResponse) => {
        this.successMessage = response.message || 'A password reset link has been sent to your email.';
        this.snackBar.open(this.successMessage, 'Close', { 
          duration: 5000,
          panelClass: ['bg-green-600', 'text-white']
        });
        this.forgotPasswordData.email = ''; // Clear the form
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to send reset email. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { 
          duration: 5000,
          panelClass: ['bg-red-600', 'text-white']
        });
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}