import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const credentials: LoginRequest = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      };
      
      console.log('Attempting login with API:', credentials);
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login response:', response);
          
          if (response.success) {
            this.message.success(response.message || 'Đăng nhập thành công!');
            this.router.navigate(['/home']);
          } else {
            this.message.error(response.error || response.message || 'Đăng nhập thất bại!');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          
          let errorMessage = 'Có lỗi xảy ra trong quá trình đăng nhập!';
          
          if (error.status === 401) {
            errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng!';
          } else if (error.status === 0) {
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!';
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.message.error(errorMessage);
        }
      });
    } else {
      // Mark all fields as dirty to show validation errors
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
