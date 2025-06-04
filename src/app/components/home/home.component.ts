import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarOpen = true; // State cho sidebar
  
  // Dropdown states
  dropdownStates = {
    phanCong: false,
    uyQuyen: false,
    hoatDong: false,
    heThong: false
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Lấy thông tin user từ AuthService
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      // Nếu không có thông tin đăng nhập, chuyển về login
      this.router.navigate(['/login']);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDropdown(dropdownName: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Toggle the specified dropdown
    switch(dropdownName) {
      case 'phanCong':
        this.dropdownStates.phanCong = !this.dropdownStates.phanCong;
        break;
      case 'uyQuyen':
        this.dropdownStates.uyQuyen = !this.dropdownStates.uyQuyen;
        break;
      case 'hoatDong':
        this.dropdownStates.hoatDong = !this.dropdownStates.hoatDong;
        break;
      case 'heThong':
        this.dropdownStates.heThong = !this.dropdownStates.heThong;
        break;
    }
  }

  logout(): void {
    // Sử dụng AuthService để logout
    this.authService.logout();
  }
}
