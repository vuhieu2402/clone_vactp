import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = 'https://10.128.10.82:8443/ips/management/platform/foundations/list'; // Thử lại IP cũ
  private httpClient: HttpClient;

  constructor(
    handler: HttpBackend,
    private authService: AuthService
  ) {
    // Tạo HttpClient mới bỏ qua interceptors để tránh vấn đề SSL
    this.httpClient = new HttpClient(handler);
  }

  getBranches(): Observable<any[]> {
    // Lấy token từ AuthService
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('No token found, user not logged in');
      console.warn('Please login first to get real data from API');
      // Trả về thông báo để user biết cần login
      return of([]);
    }

    // Thêm headers cần thiết cho API
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Body theo format yêu cầu
    const requestBody = {
      token: token,
      foundation_id: "",
      foundation_path: ""
    };

    console.log('Sending request with token:', token.substring(0, 20) + '...');
    console.log('Request body structure:', { ...requestBody, token: '[HIDDEN]' });

    return this.httpClient.post<any>(this.apiUrl, requestBody, { headers }).pipe(
      timeout(30000), // Tăng timeout lên 30 giây
      map(response => {
        console.log('Full API Response:', response);
        
        // Kiểm tra status code từ response
        if (response && response.status === 0) {
          console.error('API returned status 0:', response.message);
          if (response.message === 'connection was expired') {
            console.warn('Token may have expired, please login again');
          }
          return [];
        }
        
        // Kiểm tra nếu có status success
        if (response && response.status === 1 && response.data) {
          console.log('API success, processing data:', response.data);
          console.log('Data type:', typeof response.data);
          console.log('Is array:', Array.isArray(response.data));
          
          if (Array.isArray(response.data)) {
            console.log('Data length:', response.data.length);
            if (response.data.length > 0) {
              console.log('First item structure:', Object.keys(response.data[0]));
              console.log('First item:', response.data[0]);
            }
            return response.data;
          } else {
            console.log('Data is not array, converting...');
            // Nếu data không phải array, có thể cần chuyển đổi
            if (response.data && typeof response.data === 'object') {
              console.log('Data object keys:', Object.keys(response.data));
              // Thử tìm array trong object
              for (const key of Object.keys(response.data)) {
                if (Array.isArray(response.data[key])) {
                  console.log(`Found array in property '${key}':`, response.data[key]);
                  return response.data[key];
                }
              }
            }
          }
        }
        
        // Kiểm tra nếu response là array
        if (Array.isArray(response)) {
          console.log('Response is direct array, length:', response.length);
          return response;
        }
        
        // Kiểm tra các property phổ biến có thể chứa array
        if (response && response.data && Array.isArray(response.data)) {
          console.log('Found array in response.data');
          return response.data;
        }
        
        if (response && response.items && Array.isArray(response.items)) {
          console.log('Found array in response.items');
          return response.items;
        }
        
        if (response && response.list && Array.isArray(response.list)) {
          console.log('Found array in response.list');
          return response.list;
        }
        
        if (response && response.foundations && Array.isArray(response.foundations)) {
          console.log('Found array in response.foundations');
          return response.foundations;
        }
        
        if (response && response.result && Array.isArray(response.result)) {
          console.log('Found array in response.result');
          return response.result;
        }
        
        // Nếu không tìm thấy array, log response structure và trả về array rỗng
        console.warn('Could not find array in response. Response structure:', Object.keys(response || {}));
        console.warn('Full response:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error fetching branches:', error);
        
        if (error.name === 'TimeoutError') {
          console.error('Request timed out - server might be slow or unreachable');
        } else if (error.status === 401) {
          console.error('Unauthorized - token may be invalid or expired');
        } else if (error.status === 403) {
          console.error('Forbidden - insufficient permissions');
        }
        
        // Nếu có lỗi, trả về array rỗng
        return of([]);
      })
    );
  }
}
