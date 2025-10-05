import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
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

export interface Role {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by_id: number | null;
  created_by_name: string | null;
  updated_by_id: number | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryResponse {
  message: string;
  status: number;
  data?: Category | Category[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  is_active?: boolean;
  created_by?: number;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  updated_by?: number;
}

export interface Slot {
  id: number;
  category_id: number;
  category_name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_by_id: number | null;
  created_by_name: string | null;
  updated_by_id: number | null;
  updated_by_name: string | null;
}

export interface SlotResponse {
  message: string;
  status: number;
  data?: Slot | Slot[];
  total_count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface SlotCreateRequest {
  category: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface SlotUpdateRequest {
  category?: number;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface Booking {
  id: number;
  slot: number;
  user: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookingResponse {
  message: string;
  status: number;
  data?: Booking | Booking[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface BookingCreateRequest {
  slot: number;
  user: number;
}

export interface BookingUpdateRequest {
  slot?: number;
  status?: string;
}

export interface DashboardSummary {
  total_categories: number;
  active_categories: number;
  inactive_categories: number;
  total_slots: number;
  active_slots: number;
  inactive_slots: number;
  total_bookings: number;
  booked_slots: number;
  cancelled_bookings: number;
  total_users: number;
}

export interface RecentBooking {
  id: number;
  slot_id: number | null;
  slot_time: string | null;
  user_id: number | null;
  user_name: string | null;
  status: string;
  created_at: string;
}

export interface RecentSlot {
  id: number;
  category_id: number | null;
  category_name: string | null;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_by_id: number | null;
  created_by_name: string | null;
}

export interface RecentCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_by_id: number | null;
  created_by_name: string | null;
  created_at: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  recent_bookings: RecentBooking[];
  recent_slots: RecentSlot[];
  recent_categories: RecentCategory[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  private handleUnauthorized(error: any): Observable<never> {
    if (error.status === 401) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        return this.refreshToken(refreshToken).pipe(
          switchMap((response: RefreshResponse) => {
            this.setAccessToken(response.access);
            // Note: Original request retry logic should be implemented here if needed
            return throwError(() => error);
          }),
          catchError(() => {
            this.logout();
            return throwError(() => new Error('Session expired. Please log in again.'));
          })
        );
      } else {
        this.logout();
        return throwError(() => new Error('Session expired. Please log in again.'));
      }
    }
    return throwError(() => error);
  }

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
      if (filters.role !== undefined) params = params.set('role', filters.role.toString());
    }

    return this.http.get<UsersResponse>(`${this.baseUrl}/users/`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  getRoles(): Observable<{ message: string; status: number; data: Role[] }> {
    return this.http.get<{ message: string; status: number; data: Role[] }>(`${this.baseUrl}/role/`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  createCategory(data: CategoryCreateRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${this.baseUrl}/categories/`, data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  listCategories(page: number, pageSize: number, filters?: {
    name?: string;
    is_active?: boolean;
    created_by?: number;
    from_date?: string;
    to_date?: string;
  }): Observable<CategoryResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.is_active !== undefined) params = params.set('is_active', filters.is_active.toString());
      if (filters.created_by) params = params.set('created_by', filters.created_by.toString());
      if (filters.from_date) params = params.set('from_date', filters.from_date);
      if (filters.to_date) params = params.set('to_date', filters.to_date);
    }

    return this.http.get<CategoryResponse>(`${this.baseUrl}/categories/`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  getCategory(id: number): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.baseUrl}/categories/${id}/`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  updateCategory(id: number, data: CategoryUpdateRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.baseUrl}/categories/${id}/`, data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  deleteCategory(id: number): Observable<CategoryResponse> {
    return this.http.delete<CategoryResponse>(`${this.baseUrl}/categories/${id}/`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  createSlot(data: SlotCreateRequest): Observable<SlotResponse> {
    return this.http.post<SlotResponse>(`${this.baseUrl}/slots/`, data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  listSlots(page: number, pageSize: number, filters?: {
    category?: number;
    is_active?: boolean;
  }): Observable<SlotResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (filters) {
      if (filters.category) params = params.set('category', filters.category.toString());
      if (filters.is_active !== undefined) params = params.set('is_active', filters.is_active.toString());
    }

    return this.http.get<SlotResponse>(`${this.baseUrl}/slots/`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  getSlot(id: number): Observable<SlotResponse> {
    return this.http.get<SlotResponse>(`${this.baseUrl}/slots/${id}/`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  updateSlot(id: number, data: SlotUpdateRequest): Observable<SlotResponse> {
    return this.http.put<SlotResponse>(`${this.baseUrl}/slots/${id}/`, data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  deleteSlot(id: number): Observable<SlotResponse> {
    return this.http.delete<SlotResponse>(`${this.baseUrl}/slots/${id}/`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  listBookings(page: number, pageSize: number, filters?: {
    slot_id?: number;
    user_id?: number;
    status?: string;
    from_date?: string;
    to_date?: string;
  }): Observable<BookingResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (filters) {
      if (filters.slot_id) params = params.set('slot_id', filters.slot_id.toString());
      if (filters.user_id) params = params.set('user_id', filters.user_id.toString());
      if (filters.status) params = params.set('status', filters.status);
      if (filters.from_date) params = params.set('from_date', filters.from_date);
      if (filters.to_date) params = params.set('to_date', filters.to_date);
    }

    return this.http.get<BookingResponse>(`${this.baseUrl}/bookings/`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  getBooking(id: number): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.baseUrl}/bookings/${id}/`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  createBooking(data: BookingCreateRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/bookings/`, data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  updateBooking(id: number, data: BookingUpdateRequest): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${this.baseUrl}/bookings/${id}/`, data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  deleteBooking(id: number): Observable<BookingResponse> {
    return this.http.delete<BookingResponse>(`${this.baseUrl}/bookings/${id}/`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard/`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.handleUnauthorized(err)));
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

  logout(): void {
    this.clearTokens();
    this.router.navigate(['/login']);
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