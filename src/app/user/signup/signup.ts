import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, SignUpRequest, SignUpResponse } from '../../service/api.service';
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
  selector: 'app-signup',
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
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignUpComponent {
  signupData: SignUpRequest = {
    name: '',
    email: '',
    role: 2, // Default to User (role_id: 2)
    password: '',
    confirm_password: ''
  };
  errorMessage = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private apiService: ApiService, private router: Router, private snackBar: MatSnackBar) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Client-side validation
  private validateForm(): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;


    if (!this.signupData.name.trim()) {
      return 'Name is required';
    }
    if (!emailRegex.test(this.signupData.email)) {
      return 'Please enter a valid email address';
    }
    if (!passwordRegex.test(this.signupData.password)) {
      return 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (this.signupData.password !== this.signupData.confirm_password) {
      return 'Passwords do not match';
    }
    return null;
}


  onSubmit(): void {
    // Perform client-side validation
    const validationError = this.validateForm();
    if (validationError) {
      this.errorMessage = validationError;
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.apiService.signup(this.signupData).subscribe({
      next: (response: SignUpResponse) => {
        this.snackBar.open(response.message, 'Close', { duration: 5000 });
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        // Handle specific backend error messages
        this.errorMessage =
          err.error?.message ||
          'Signup failed. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}