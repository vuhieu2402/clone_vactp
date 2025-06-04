import { Component, OnInit, OnDestroy } from '@angular/core';
import { BranchService } from '../../services/branch.service';
import { ViolationService } from '../../services/violation.service';
import { interval, Subscription } from 'rxjs';

interface TableData {
  tenKho: string;
  trangThai: string;
  thoiGian: Date;
  nguoiThucHien: string;
  ghiChu: string;
}

interface ChartData {
  date: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Properties for the dashboard
  selectedBranch: string = '';
  startDate: Date | null = null;
  endDate: Date = new Date();
  isTableView: boolean = false;
  branches: any[] = [];
  isLoadingBranches: boolean = false;
  private dateUpdateSubscription?: Subscription;
  isLoadingChart: boolean = false;
  
  // Chart data
  chartData: ChartData[] = [];
  
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

  constructor(
    private branchService: BranchService,
    private violationService: ViolationService
  ) { }

  ngOnInit(): void {
    this.loadBranches();
    this.startRealtimeDateUpdate();
    this.loadViolationData();
  }

  ngOnDestroy(): void {
    // Hủy subscription khi component bị hủy
    if (this.dateUpdateSubscription) {
      this.dateUpdateSubscription.unsubscribe();
    }
  }

  // Bắt đầu cập nhật ngày theo thời gian thực
  private startRealtimeDateUpdate(): void {
    // Cập nhật mỗi giây
    this.dateUpdateSubscription = interval(1000).subscribe(() => {
      this.endDate = new Date();
    });
  }

  loadBranches(): void {
    this.isLoadingBranches = true;
    this.branchService.getBranches().subscribe(
      (data) => {
        // Đảm bảo data là array
        this.branches = Array.isArray(data) ? data : [];
        console.log('Branches loaded in dashboard:', this.branches);
        console.log('Number of branches:', this.branches.length);
        
        // Log chi tiết từng branch để debug
        this.branches.forEach((branch, index) => {
          console.log(`Branch ${index}:`, branch);
          console.log(`Branch ${index} keys:`, Object.keys(branch || {}));
        });
        
        this.isLoadingBranches = false;
      },
      (error) => {
        console.error('Error loading branches in dashboard:', error);
        this.branches = []; // Đảm bảo luôn là array
        this.isLoadingBranches = false;
      }
    );
  }

  // Helper method to get branch value for select option
  getBranchValue(branch: any): string {
    if (!branch) return '';
    
    // Thử các property phổ biến cho value
    return branch.id || 
           branch.code || 
           branch.foundation_id || 
           branch.foundation_code ||
           branch.name || 
           branch.foundation_name ||
           branch.title ||
           JSON.stringify(branch); // fallback
  }

  // Helper method to get branch label for display
  getBranchLabel(branch: any): string {
    if (!branch) return '';
    
    // Thử các property phổ biến cho display name
    return branch.name || 
           branch.label || 
           branch.title ||
           branch.foundation_name ||
           branch.display_name ||
           branch.description ||
           branch.id ||
           branch.code ||
           'Unnamed Branch';
  }

  // TrackBy function for better performance
  trackBranch(index: number, branch: any): any {
    return branch ? (branch.id || branch.code || index) : index;
  }

  // Method to refresh data
  refresh() {
    this.loadBranches();
    this.loadViolationData();
  }

  // Method to export report
  exportReport() {
    // Implement export logic here
  }

  // Method to toggle view
  toggleView() {
    this.isTableView = !this.isTableView;
  }

  // Load violation data from API
  loadViolationData() {
    this.isLoadingChart = true;
    // Thay thế 'your_token_here' bằng token thực tế từ authentication service
    const token = localStorage.getItem('access_token') || '';
    
    this.violationService.getViolationData(token, this.selectedBranch)
      .subscribe({
        next: (response) => {
          // Xử lý dữ liệu từ API và chuyển đổi thành định dạng chartData
          this.processViolationData(response);
          this.isLoadingChart = false;
        },
        error: (error) => {
          console.error('Error loading violation data:', error);
          this.isLoadingChart = false;
          // Fallback to sample data in case of error
          this.generateChartData();
        }
      });
  }

  // Process API response data
  private processViolationData(response: any) {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date;
    });

    // Chuyển đổi dữ liệu API thành định dạng chartData
    this.chartData = last7Days.map(date => {
      const dateStr = this.formatDateForAPI(date);
      const violations = response[dateStr] || 0;
      return {
        date: this.formatDate(date),
        value: violations
      };
    });
  }

  // Format date for API request (YYYY-MM-DD)
  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Generate sample data for the last 7 days
  generateChartData(): void {
    const today = new Date();
    this.chartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return {
        date: this.formatDate(date),
        value: Math.floor(Math.random() * 5)
      };
    });
  }

  // Format date as dd-MM-yyyy
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const dayOfWeek = this.getDayOfWeek(date);
    return `${dayOfWeek} (${day}-${month}-${year})`;
  }

  // Get day of week in Vietnamese
  private getDayOfWeek(date: Date): string {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  }

  // Generate SVG path for the chart line
  getChartPath(): string {
    return 'M ' + this.chartData.map((point, index) => 
      `${(index * (100 / 6))} ${(5 - point.value) * 20}`
    ).join(' L ');
  }

  // Get point coordinates for circles
  getPointX(index: number): string {
    return `${(index * (100 / 6))}%`;
  }

  getPointY(value: number): string {
    return `${(5 - value) * 20}%`;
  }
} 