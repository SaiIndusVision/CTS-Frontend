import { Routes } from '@angular/router';
import { LoginComponent } from './user/login/login';
import { ForgotPasswordComponent } from './user/forgotpassword/forgotpassword';
import { SignUpComponent } from './user/signup/signup';
import { ResetPasswordComponent } from './user/resetpassword/resetpassword';
import { DashboardComponent } from './dashboard/dashboard';
import { authGuard } from './auth-guard';
import { UserListComponent } from './user/user-list/user-list';
import { CategoryComponent } from './slots/category/category';
import { TimeslotsComponent } from './slots/timeslots/timeslots';
import { BookingsComponent } from './user/bookings/bookings';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'bookings/:userId', component: BookingsComponent, canActivate: [authGuard] },
  { path: 'users', component: UserListComponent, canActivate: [authGuard] },
  { path: 'slots', component: TimeslotsComponent, canActivate: [authGuard] },
  { path: 'category', component: CategoryComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];