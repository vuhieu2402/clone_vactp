import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { LoginRequest, LoginResponse, User } from '../models/auth.model';
import { API_URLS } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(API_URLS.LOGIN, credentials, { headers })
      .pipe(
        map(response => {
          // Xử lý response từ backend

          const loginResponse: LoginResponse = {
            success: response.success || (response.status === 'success') || !!response.token,
            message: response.message || 'Đăng nhập thành công',
            data: {
              token: response.token || response.accessToken || response.data?.token,
              user: response.user || response.data?.user || {
                id: response.userId || response.id || '1',
                username: credentials.username,
                email: response.email,
                fullName: response.fullName || response.name
              }
            }
          };

          // Lưu token và user info nếu login thành công
          if (loginResponse.success && loginResponse.data?.token) {
            this.setToken(loginResponse.data.token);
            if (loginResponse.data.user) {
              this.setUser(loginResponse.data.user);
            }
          }

          return loginResponse;
        }),
        catchError(error => {
          console.error('Login error:', error);
          
          // Xử lý error response
          const errorResponse: LoginResponse = {
            success: false,
            error: error.error?.message || error.message || 'Đăng nhập thất bại',
            message: 'Có lỗi xảy ra trong quá trình đăng nhập'
          };
          
          return throwError(() => errorResponse);
        })
      );
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('isLoggedIn'); // Compatibility
    this.router.navigate(['/login']);
  }

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Lấy token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Lưu token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem('isLoggedIn', 'true'); // Compatibility
  }

  /**
   * Lấy thông tin user
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Lưu thông tin user
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user)); // Compatibility
  }
} 