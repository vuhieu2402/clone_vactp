import { Component } from '@angular/core';

interface TableData {
  tenKho: string;
  trangThai: string;
  thoiGian: Date;
  nguoiThucHien: string;
  ghiChu: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  // Properties for the dashboard
  selectedBranch: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  isTableView: boolean = false; // Default to dashboard view
  
  // Sample table data
  tableData: TableData[] = [
    {
      tenKho: 'Kho Quỹ 001',
      trangThai: 'Đóng',
      thoiGian: new Date('2025-06-03 08:00:00'),
      nguoiThucHien: 'Nguyễn Văn A',
      ghiChu: 'Đóng kho theo lịch'
    },
    {
      tenKho: 'Kho Quỹ 002',
      trangThai: 'Đóng',
      thoiGian: new Date('2025-06-03 08:30:00'),
      nguoiThucHien: 'Trần Thị B',
      ghiChu: 'Đóng kho cuối ca'
    },
    {
      tenKho: 'Kho Quỹ 003',
      trangThai: 'Mở',
      thoiGian: new Date('2025-06-03 07:00:00'),
      nguoiThucHien: 'Lê Văn C',
      ghiChu: 'Mở kho đầu ca'
    }
  ];

  // Method to refresh data
  refresh() {
    // Implement refresh logic here
  }

  // Method to export report
  exportReport() {
    // Implement export logic here
  }

  // Method to toggle view
  toggleView() {
    this.isTableView = !this.isTableView;
  }
} 