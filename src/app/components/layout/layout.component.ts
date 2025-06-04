import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  isSidebarOpen = true;
  dropdownStates: { [key: string]: boolean } = {
    phanCong: false,
    uyQuyen: false,
    hoatDong: false,
    heThong: false
  };

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDropdown(key: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.dropdownStates[key] = !this.dropdownStates[key];
  }
} 