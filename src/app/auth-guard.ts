import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { ApiService } from './service/api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  // Check if access_token and refresh_token exist
  const accessToken = apiService.getAccessToken();
  const refreshToken = apiService.getRefreshToken();
  const isAuthenticated = accessToken && refreshToken;

  // If user is authenticated and trying to access /login, redirect to /dashboard
  if (isAuthenticated && state.url.startsWith('/login')) {
    router.navigate(['/dashboard']);
    return false;
  }

  // For protected routes, allow access if authenticated, else redirect to /login
  if (isAuthenticated) {
    return true; // Allow access to protected routes
  }

  // Redirect to login if not authenticated
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};