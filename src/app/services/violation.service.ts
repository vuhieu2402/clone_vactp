import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViolationService {
  private baseUrl = 'https://10.128.10.82:8443/ips/management/apps/sve/reports/violates/dashboards/foundation/pull';

  constructor(private http: HttpClient) { }

  getViolationData(token: string, foundationId: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      token: token,
      foundation_id: foundationId
    };

    return this.http.post(this.baseUrl, body, { 
      headers: headers,
      // Bỏ qua xác thực SSL trong môi trường development
      ...(environment.production ? {} : { withCredentials: false })
    });
  }
} 