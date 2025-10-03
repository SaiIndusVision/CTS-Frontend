import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { ApiService, RefreshResponse } from './api.service';

// Singleton state for refresh token logic
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const apiService = inject(ApiService); // Inject ApiService

  // Add token to headers
  const authReq = addTokenHeader(req, apiService);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/token/refresh/')) {
        return handle401Error(req, next, apiService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(req: HttpRequest<any>, apiService: ApiService): HttpRequest<any> {
  const token = apiService.getAccessToken();
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, apiService: ApiService): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = apiService.getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      apiService.clearTokens();
      return throwError(() => new Error('No refresh token available'));
    }

    return apiService.refreshToken(refreshToken).pipe(
      switchMap((response: RefreshResponse) => {
        isRefreshing = false;
        apiService.setAccessToken(response.access);
        refreshTokenSubject.next(response.access);
        return next(addTokenHeader(req, apiService));
      }),
      catchError((err) => {
        isRefreshing = false;
        apiService.clearTokens();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addTokenHeader(req, apiService)))
    );
  }
}