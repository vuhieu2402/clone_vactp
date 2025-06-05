import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViolationService {
  private baseUrl = 'https://10.128.10.82:8443/ips/management/apps/sve/reports/violates/dashboards/foundation/pull';
  private downloadUrl = 'https://10.128.10.82:8443/ips/management/apps/sve/reports/violates/dashboards/foundation/export';

  constructor(private http: HttpClient) { }

  getViolationData(token: string, foundationId: string = '', startTime?: number, endTime?: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Gửi đầy đủ thông tin bao gồm start_time và end_time
    const body = {
      token: token,
      foundation_id: foundationId,
      start_time: startTime,
      end_time: endTime
    };

    console.log('API Request body:', body);
    console.log('Start time (readable):', startTime ? new Date(startTime) : 'undefined');
    console.log('End time (readable):', endTime ? new Date(endTime) : 'undefined');

    return this.http.post(this.baseUrl, body, { 
      headers: headers,
      ...(environment.production ? {} : { withCredentials: false })
    });
  }

  downloadReport(token: string, foundationId: string = '', startTime?: number, endTime?: number, reportType: string = 'excel'): Observable<any> {
    console.log('🔍 Trying download with parameters:', {
      token: token ? 'Present' : 'Missing',
      foundationId,
      startTime,
      endTime,
      reportType,
      downloadUrl: this.downloadUrl
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Try improved body with more explicit format specification
    const body = {
      token: token,
      foundation_id: foundationId,
      start_time: startTime,
      end_time: endTime,
      format: reportType === 'excel' ? 'xlsx' : 'pdf',  // More explicit format
      export_type: reportType,                          // Alternative field name
      output_format: reportType === 'excel' ? 'xlsx' : 'pdf'  // Another alternative
    };

    console.log('📤 Download API Request body:', body);
    console.log('📤 Trying endpoint:', this.downloadUrl);

    // Try as blob first since we expect file content
    return this.http.post(this.downloadUrl, body, { 
      headers: headers,
      responseType: 'blob',
      ...(environment.production ? {} : { withCredentials: false })
    });
  }

  // Try GET method instead of POST (để test thử)
  downloadReportWithGet(token: string, foundationId: string = '', startTime?: number, endTime?: number, reportType: string = 'excel'): Observable<any> {
    const params: string[] = [];
    params.push(`token=${encodeURIComponent(token)}`);
    if (foundationId) params.push(`foundation_id=${encodeURIComponent(foundationId)}`);
    if (startTime) params.push(`start_time=${startTime}`);
    if (endTime) params.push(`end_time=${endTime}`);
    params.push(`report_type=${encodeURIComponent(reportType)}`);

    const urlWithParams = `${this.downloadUrl}?${params.join('&')}`;
    console.log('🔄 Trying GET method with URL:', urlWithParams);

    return this.http.get(urlWithParams, { 
      responseType: 'text',
      ...(environment.production ? {} : { withCredentials: false })
    });
  }


  downloadReportAlternative(token: string, foundationId: string = '', startTime?: number, endTime?: number, reportType: string = 'excel'): Observable<any> {
    // Try the same base path as violation data but with different endpoint
    const alternativeUrl = 'https://10.128.10.82:8443/ips/management/apps/sve/reports/violates/dashboards/foundation/export';
    console.log('🔄 Trying alternative endpoint:', alternativeUrl);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      token: token,
      foundation_id: foundationId,
      start_time: startTime,
      end_time: endTime,
      report_type: reportType
    };

    return this.http.post(alternativeUrl, body, { 
      headers: headers,
      responseType: 'text',
      ...(environment.production ? {} : { withCredentials: false })
    });
  }
} 