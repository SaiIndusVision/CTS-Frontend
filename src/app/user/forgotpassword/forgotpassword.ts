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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Add this import

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
    MatProgressSpinnerModule // Add this to imports
  ],
  templateUrl: './forgotpassword.html',
  styleUrls: ['./forgotpassword.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordData: ForgotPasswordRequest = { email: '' };
  errorMessage = '';
  loading = false;

  constructor(private apiService: ApiService, private router: Router, private snackBar: MatSnackBar) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.forgotPassword(this.forgotPasswordData).subscribe({
      next: (response: ForgotPasswordResponse) => {
        this.snackBar.open(response.message, 'Close', { duration: 5000 });
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to send reset email. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}