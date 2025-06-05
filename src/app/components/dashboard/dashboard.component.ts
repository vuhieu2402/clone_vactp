import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { BranchService } from '../../services/branch.service';
import { ViolationService } from '../../services/violation.service';
import { Subscription } from 'rxjs';

interface ChartData {
  date: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedBranch: string = 'all';
  startDate: Date = new Date();
  endDate: Date = new Date();
  isTableView: boolean = false;
  branches: any[] = [];
  isLoadingBranches: boolean = false;
  isLoadingChart: boolean = false;
  isDownloading: boolean = false;
  
  chartData: ChartData[] = [];

  constructor(
    private branchService: BranchService,
    private violationService: ViolationService
  ) {
    // Set default date range (today - 6 days to today)
    this.startDate.setDate(this.endDate.getDate() - 6);
    this.startDate.setHours(0, 0, 0, 0);
    this.endDate.setHours(23, 59, 59, 999);
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadViolationData();
  }

  ngAfterViewInit(): void {
    this.setupTooltipListeners();
  }

  ngOnDestroy(): void {
    // Component cleanup if needed
  }

  private setupTooltipListeners(): void {
    // Setup tooltip for chart points
    setTimeout(() => {
      const circles = document.querySelectorAll('circle[data-tooltip]');
      const tooltip = document.getElementById('chart-tooltip');
      
      if (tooltip) {
        circles.forEach(circle => {
          circle.addEventListener('mouseenter', (e: any) => {
            const tooltipText = e.target.getAttribute('data-tooltip');
            if (tooltipText) {
              tooltip.textContent = tooltipText;
              tooltip.classList.remove('opacity-0');
              tooltip.classList.add('opacity-100');
            }
          });
          
          circle.addEventListener('mousemove', (e: any) => {
            const rect = e.target.closest('svg').getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = (y - 10) + 'px';
          });
          
          circle.addEventListener('mouseleave', () => {
            tooltip.classList.remove('opacity-100');
            tooltip.classList.add('opacity-0');
          });
        });
      }
    }, 100);
  }

  // Handle branch selection changes
  onBranchChange(): void {
    console.log('Branch changed to:', this.selectedBranch);
    this.loadViolationData();
  }

  // Handle date changes
  onDateChange(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      
      this.loadViolationData();
    }
  }

  // Get foundation ID for API request
  private getFoundationId(): string {
    let foundationId = '';
    
    if (this.selectedBranch === 'all' || !this.selectedBranch) {
      foundationId = '';
    } else {
      foundationId = this.selectedBranch;
    }
    
    console.log('Foundation ID being used:', foundationId);
    console.log('Selected branch value:', this.selectedBranch);
    
    return foundationId;
  }

  loadBranches(): void {
    this.isLoadingBranches = true;
    this.branchService.getBranches().subscribe(
      (data) => {
        this.branches = Array.isArray(data) ? data : [];
        this.isLoadingBranches = false;
      },
      (error) => {
        console.error('Error loading branches:', error);
        this.branches = [];
        this.isLoadingBranches = false;
      }
    );
  }

  loadViolationData() {
    this.isLoadingChart = true;
    
    const token = localStorage.getItem('SVE_SESSION_ACCESS_TOKEN') || 
                localStorage.getItem('accessToken') || 
                localStorage.getItem('auth_token') ||
                localStorage.getItem('access_token_sve') || 
                localStorage.getItem('access_token') || 
                localStorage.getItem('token') || 
                '';
    
    const foundationId = this.getFoundationId();
    
    console.log('Token being used:', token);
    console.log('Foundation ID:', foundationId);
    
    if (foundationId === '') {
      console.log('🌍 Đang lấy dữ liệu tổng hợp của TẤT CẢ chi nhánh');
    } else {
      console.log('�� Đang lấy dữ liệu của chi nhánh cụ thể:', foundationId);
    }

    const startTimestamp = this.startDate.getTime();
    const endTimestamp = this.endDate.getTime();
    
    console.log('Date range:', {
      start: this.startDate,
      end: this.endDate,
      startTimestamp,
      endTimestamp
    });
    
    this.violationService.getViolationData(token, foundationId, startTimestamp, endTimestamp)
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          if (response && response.status === 0) {
            console.error('API Error:', response.message);
            this.isLoadingChart = false;
            return;
          }
          
          if (response && response.status === 1) {
            this.processViolationData(response.data || []);
            // Re-setup tooltip listeners after data changes
            setTimeout(() => this.setupTooltipListeners(), 100);
          } else {
            this.chartData = [];
          }
          this.isLoadingChart = false;
        },
        error: (error) => {
          console.error('Error loading violation data:', error);
          this.isLoadingChart = false;
          this.chartData = [];
        }
      });
  }

  private processViolationData(apiData: any[]) {
    console.log('Processing violation data:', apiData);
    
    const dates: Date[] = [];
    let currentDate = new Date(this.startDate);
    
    while (currentDate <= this.endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.chartData = dates.map(date => {
      const violationItem = apiData.find(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toDateString() === date.toDateString();
      });
      
      const violations = violationItem ? violationItem.totalNumberOfViolents : 0;
      
      return {
        date: this.formatDate(date),
        value: violations
      };
    });
    
    console.log('Processed chart data:', this.chartData);
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const dayOfWeek = this.getDayOfWeek(date);
    return `${dayOfWeek} (${day}-${month}-${year})`;
  }

  private getDayOfWeek(date: Date): string {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  }

  // Chart methods
  getChartPath(): string {
    if (!this.chartData.length) return '';
    
    const maxValue = this.getMaxValue();
    console.log('Chart data for path:', this.chartData);
    console.log('Max value:', maxValue);
    
    // Tạo points với tọa độ chính xác (dùng viewBox coordinates)
    const points = this.chartData.map((point, index) => {
      const x = (index / (this.chartData.length - 1)) * 100; // 0 đến 100
      const y = 10 + ((maxValue - point.value) / maxValue) * 80; // 10 đến 90
      return { x, y, value: point.value };
    });
    
    console.log('Points for path:', points);
    
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }
    
    // Tạo path đơn giản với đường thẳng
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    console.log('Generated path:', path);
    return path;
  }

  getPointX(index: number): string {
    if (!this.chartData.length) return '0%';
    if (this.chartData.length === 1) return '50%';
    const x = (index / (this.chartData.length - 1)) * 100;
    return `${x}%`;
  }

  getPointY(value: number): string {
    const maxValue = this.getMaxValue();
    const y = 10 + ((maxValue - value) / maxValue) * 80; // 10% đến 90%
    return `${y}%`;
  }

  getPointColor(value: number): string {
    if (value === 0) return '#94a3b8';
    if (value <= 2) return '#22c55e';
    if (value <= 5) return '#f59e0b';
    return '#ef4444';
  }

  getMaxValue(): number {
    const dataMax = Math.max(...this.chartData.map(d => d.value));
    return Math.max(dataMax, 5); // Tối thiểu là 5
  }

  getYAxisLabels(): number[] {
    const maxValue = this.getMaxValue();
    const step = Math.max(1, Math.ceil(maxValue / 5));
    
    // Tạo labels từ maxValue xuống 0
    const labels: number[] = [];
    for (let i = 0; i <= 5; i++) {
      const value = maxValue - (i * step);
      if (value >= 0) {
        labels.push(value);
      }
    }
    
    // Đảm bảo luôn có label 0 ở cuối
    if (labels[labels.length - 1] !== 0) {
      labels.push(0);
    }
    
    return labels;
  }

  // View methods
  toggleView(): void {
    this.isTableView = !this.isTableView;
  }

  refresh(): void {
    console.log('🔄 Làm mới dashboard - Reset về trạng thái ban đầu');
    
    // Reset branch selection về "Tất cả chi nhánh"
    this.selectedBranch = 'all';
    
    // Reset date range về default (hôm nay trừ 6 ngày đến hôm nay)
    this.startDate = new Date();
    this.endDate = new Date();
    this.startDate.setDate(this.endDate.getDate() - 6);
    this.startDate.setHours(0, 0, 0, 0);
    this.endDate.setHours(23, 59, 59, 999);
    
    // Clear chart data
    this.chartData = [];
    
    // Reset loading states
    this.isLoadingBranches = false;
    this.isLoadingChart = false;
    
    console.log('📅 Date range reset:', {
      startDate: this.startDate,
      endDate: this.endDate
    });
    console.log('🏢 Branch reset to:', this.selectedBranch);
    
    // Reload data
    this.loadBranches();
    this.loadViolationData();
    
    console.log('✅ Dashboard refresh completed');
  }

  exportReport(): void {
    // Export functionality
  }

  // Download report with specific type
  downloadReportFile(reportType: string): void {
    console.log(`📥 Bắt đầu download báo cáo ${reportType.toUpperCase()}`);
    
    this.isDownloading = true;
    
    try {
      // Get current parameters
      const token = localStorage.getItem('SVE_SESSION_ACCESS_TOKEN') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('auth_token') ||
                  localStorage.getItem('access_token_sve') || 
                  localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  '';
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const foundationId = this.getFoundationId();
      const startTimestamp = this.startDate.getTime();
      const endTimestamp = this.endDate.getTime();
      
      console.log('Download parameters:', {
        reportType,
        foundationId,
        startDate: this.startDate,
        endDate: this.endDate,
        startTimestamp,
        endTimestamp,
        hasToken: !!token
      });
      
      this.violationService.downloadReport(token, foundationId, startTimestamp, endTimestamp, reportType)
        .subscribe({
          next: (blob: Blob) => {
            console.log('📁 Download response received:', blob);
            console.log('📁 Blob details:', {
              size: blob.size,
              type: blob.type
            });
            
            // Check if we actually got a blob
            if (blob instanceof Blob) {
              if (blob.size === 0) {
                alert('❌ File rỗng từ server');
                this.isDownloading = false;
                return;
              }
              
              // Check if it's actually HTML/JSON response (some servers return error as HTML)
              if (blob.type.includes('text/html') || blob.type.includes('application/json')) {
                console.log('⚠️ Server returned HTML/JSON instead of file');
                alert('❌ Server trả về HTML/JSON thay vì file. Endpoint có thể không đúng.');
                this.isDownloading = false;
                return;
              }
              
              console.log('✅ Valid file blob received, processing download...');
              this.processDownload(blob, reportType);
            } else {
              console.error('❌ Response is not a Blob:', blob);
              alert('❌ Response không phải file blob');
              this.isDownloading = false;
            }
          },
          error: (error) => {
            console.error('❌ Download error:', error);
            console.error('❌ Error type:', typeof error);
            console.error('❌ Error details:', error.error || {});
            
            this.isDownloading = false;
            
            let errorMessage = 'Lỗi không xác định';
            if (error?.message) {
              errorMessage = error.message;
            } else if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.status) {
              errorMessage = `HTTP ${error.status}: ${error.statusText || 'Server error'}`;
            }
            
            alert(`Lỗi khi tải báo cáo: ${errorMessage}`);
          }
        });
    } catch (error) {
      console.error('❌ Setup error:', error);
      this.isDownloading = false;
      alert(`Lỗi setup: ${error}`);
    }
  }
  
  private processDownload(blob: Blob, reportType: string): void {
    try {
      console.log('📁 Processing download:', {
        type: blob.type,
        size: blob.size
      });
      
      if (!blob || blob.size === 0) {
        throw new Error('File rỗng hoặc không hợp lệ');
      }
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const branchName = this.selectedBranch === 'all' ? 'TatCa' : 'ChiNhanh';
      const filename = `BaoCaoViPham_${branchName}_${dateStr}.${reportType === 'excel' ? 'xlsx' : 'pdf'}`;
      
      link.download = filename;
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      link.remove();
      
      console.log(`✅ Download completed: ${filename}`);
      this.isDownloading = false;
    } catch (error) {
      console.error('❌ Process download error:', error);
      this.isDownloading = false;
      alert(`Lỗi xử lý file: ${error}`);
    }
  }



  // Track by function for ngFor
  trackBranch(index: number, branch: any): any {
    return branch?.id || branch?.foundation_id || index;
  }

  getBranchValue(branch: any): string {
    return branch?.id || branch?.foundation_id || '';
  }

  getBranchLabel(branch: any): string {
    return branch?.name || branch?.foundation_name || 'Unknown Branch';
  }
} 