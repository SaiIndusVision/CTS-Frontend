// import { inject } from '@angular/core';
// import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
// import { ApiService } from './service/api.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const apiService = inject(ApiService);
//   const router = inject(Router);

//   // Check if access_token and refresh_token exist
//   const accessToken = apiService.getAccessToken();
//   const refreshToken = apiService.getRefreshToken();
//   const isAuthenticated = accessToken && refreshToken;

//   // If user is authenticated and trying to access /login, redirect to /dashboard
//   if (isAuthenticated && state.url.startsWith('/login')) {
//     router.navigate(['/dashboard']);
//     return false;
//   }

//   // For protected routes, allow access if authenticated, else redirect to /login
//   if (isAuthenticated) {
//     return true; // Allow access to protected routes
//   }

//   // Redirect to login if not authenticated
//   router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
//   return false;
// };

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './service/api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  const token = apiService.getAccessToken();
  const role = apiService.getRoleName();
  const userId = apiService.getUserId();

  // 1️⃣ If no token → redirect to login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const url = state.url;

  // 2️⃣ Admin-only routes (except bookings)
  const adminOnlyRoutes = ['/dashboard', '/users', '/slots', '/category'];

  if (role === 'User' && adminOnlyRoutes.some(r => url.startsWith(r))) {
    router.navigate(['/user-slot']); // redirect User to default route
    return false;
  }

  // 3️⃣ User-only routes (own bookings)
  const userOnlyRoutes = ['/user-slot', '/bookings'];

  if (role === 'Admin') {
    // Admin can access everything; no restrictions
    return true;
  }

  if (role === 'User') {
    // User can only access /user-slot and /bookings/:userId
    if (userOnlyRoutes.some(r => url.startsWith(r))) {
      // If it's /bookings/:userId, make sure it's their own ID
      if (url.startsWith('/bookings/')) {
        const segments = url.split('/');
        const requestedUserId = segments[2];
        if (requestedUserId !== userId) {
          router.navigate(['/user-slot']);
          return false;
        }
      }
      return true; // allowed
    }

    // All other routes are forbidden → redirect to user default
    router.navigate(['/user-slot']);
    return false;
  }

  // 4️⃣ Fallback for unknown routes → redirect to role default
  if (role === 'Admin') {
    router.navigate(['/dashboard']);
  } else if (role === 'User') {
    router.navigate(['/user-slot']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
