import { Routes } from '@angular/router';
import { LoginComponent } from './user/login/login';
import { ForgotPasswordComponent } from './user/forgotpassword/forgotpassword';
import { SignUpComponent } from './user/signup/signup';
import { ResetPasswordComponent } from './user/resetpassword/resetpassword';
import { DashboardComponent } from './dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];