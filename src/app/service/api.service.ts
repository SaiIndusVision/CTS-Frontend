import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  status: number;
  data: {
    user_id: number;
    name: string;
    email: string;
    role_id?: number;
    role_name?: string;
    access_token: string;
    refresh_token: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  status: number;
}

export interface SignUpRequest {
  name: string;
  email: string;
  role: number;
  password: string;
  confirm_password: string;
}

export interface SignUpResponse {
  message: string;
  status: number;
}

export interface ValidateResetTokenRequest {
  token: string;
}

export interface ValidateResetTokenResponse {
  message: string;
  status: number;
  data: {
    user_id: number;
    token: string;
  };
}

export interface ResetPasswordRequest {
  user_id: number;
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  status: number;
}

export interface RefreshResponse {
  access: string;
}

export interface UsersResponse {
  message: string;
  status: number;
  count: number;
  next: string | null;
  previous: string | null;
  data: {
    id: number;
    name: string;
    email: string;
    role: number | null;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login/`, credentials);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.baseUrl}/reset_password/`, data);
  }

  signup(data: SignUpRequest): Observable<SignUpResponse> {
    return this.http.post<SignUpResponse>(`${this.baseUrl}/signup/`, data);
  }

  validateResetToken(data: ValidateResetTokenRequest): Observable<ValidateResetTokenResponse> {
    return this.http.post<ValidateResetTokenResponse>(`${this.baseUrl}/validate-token/`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.put<ResetPasswordResponse>(`${this.baseUrl}/reset_password/${data.user_id}/`, {
      token: data.token,
      new_password: data.new_password,
      confirm_password: data.confirm_password
    });
  }

  refreshToken(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.baseUrl}/token/refresh/`, { refresh: refreshToken });
  }

  getUsers(page: number, pageSize: number, filters?: { name?: string; email?: string; role?: number }): Observable<UsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.email) params = params.set('email', filters.email);
      if (filters.role) params = params.set('role', filters.role.toString());
    }

    return this.http.get<UsersResponse>(`${this.baseUrl}/users/`, { params });
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('login_response');
    localStorage.removeItem('user_id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role_id');
    localStorage.removeItem('role_name');
  }

  handleLoginSuccess(response: LoginResponse): void {
    this.setTokens(response.data.access_token, response.data.refresh_token);
    localStorage.setItem('login_response', JSON.stringify(response));
    localStorage.setItem('user_id', response.data.user_id.toString());
    localStorage.setItem('name', response.data.name);
    localStorage.setItem('email', response.data.email);
    if (response.data.role_id !== undefined) {
      localStorage.setItem('role_id', response.data.role_id.toString());
    }
    if (response.data.role_name) {
      localStorage.setItem('role_name', response.data.role_name);
    }
  }

  getStoredLoginResponse(): LoginResponse | null {
    const stored = localStorage.getItem('login_response');
    return stored ? JSON.parse(stored) : null;
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  getRoleId(): string | null {
    return localStorage.getItem('role_id');
  }

  getRoleName(): string | null {
    return localStorage.getItem('role_name');
  }
}