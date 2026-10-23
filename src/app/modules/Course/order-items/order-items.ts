import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-items',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './order-items.html',
  styleUrl: './order-items.scss'
})
export class OrderItemsComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];
  mentors: any[] = [];
  
  // Filters
  selectedMentorId: any = '';
  selectedItemType: string = '';
  searchTerm: string = '';
  
  // KPI summary statistics
  totalRevenue: number = 0;
  totalSalesCount: number = 0;
  averagePrice: number = 0;
  
  // State
  userRole: string = 'admin';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastr.warning('Please log in first.', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.userRole = this.authService.getUserRole();
    this.loadOrderItems();
    
    if (this.userRole === 'admin') {
      this.loadMentors();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadOrderItems(): void {
    this.isLoading = true;
    let url = `${environment.apiUrl}/admin/orders/items`;
    
    // Support mentor filter for Admin
    if (this.userRole === 'admin' && this.selectedMentorId) {
      url += `?mentor_id=${this.selectedMentorId}`;
    }

    this.http.get<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success || Array.isArray(res.data)) {
          this.items = res.data || [];
          this.applyFilters();
        } else {
          this.items = [];
          this.filteredItems = [];
          this.toastr.error(res.message || 'Failed to fetch sales items', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.items = [];
        this.filteredItems = [];
        console.error('Error loading order items:', err);
        this.toastr.error('Failed to load sales report data', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  loadMentors(): void {
    this.http.get<any>(`${environment.apiUrl}/mentor`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.mentors = res.data || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading mentors:', err)
    });
  }

  applyFilters(): void {
    let result = [...this.items];

    // Item Type Filter
    if (this.selectedItemType) {
      result = result.filter(item => (item.item_type || 'course').toLowerCase() === this.selectedItemType.toLowerCase());
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(item => {
        const studentName = this.getStudentName(item).toLowerCase();
        const studentEmail = this.getStudentEmail(item).toLowerCase();
        const title = this.getItemTitle(item).toLowerCase();
        const mentorName = this.getMentorName(item).toLowerCase();
        const orderId = String(item.order_id || item.id || '').toLowerCase();
        const itemType = (item.item_type || '').toLowerCase();

        return studentName.includes(term) ||
               studentEmail.includes(term) ||
               title.includes(term) ||
               mentorName.includes(term) ||
               orderId.includes(term) ||
               itemType.includes(term);
      });
    }

    this.filteredItems = result;
    this.calculateKPIs();
  }

  calculateKPIs(): void {
    this.totalSalesCount = this.filteredItems.length;
    this.totalRevenue = this.filteredItems.reduce((acc, curr) => {
      const price = Number(curr.price || curr.amount || 0);
      return acc + price;
    }, 0);
    this.averagePrice = this.totalSalesCount > 0 ? (this.totalRevenue / this.totalSalesCount) : 0;
  }

  onFilterChange(): void {
    this.loadOrderItems();
  }

  // Safe helper getters
  getOrderId(item: any): string {
    return String(item.order_id || item.id || 'N/A');
  }

  getStudentName(item: any): string {
    return item.student?.full_name || item.student?.name || item.student_name || item.user?.name || 'Unknown Student';
  }

  getStudentEmail(item: any): string {
    return item.student?.email || item.student_email || item.user?.email || 'N/A';
  }

  getItemTitle(item: any): string {
    return item.title || item.course_name || item.item_name || item.course?.course_name || 'Untitled Item';
  }

  getItemType(item: any): string {
    return item.item_type || 'course';
  }

  getMentorName(item: any): string {
    return item.mentor_name || item.mentor?.name || item.course?.mentor?.name || 'N/A';
  }

  getPrice(item: any): number {
    return Number(item.price || item.amount || 0);
  }

  getItemTypeBadgeClass(itemType: string): string {
    const type = (itemType || '').toLowerCase();
    switch (type) {
      case 'course':
        return 'badge bg-primary-transparent text-primary border border-primary-subtle';
      case 'pdf':
        return 'badge bg-danger-transparent text-danger border border-danger-subtle';
      case 'audio':
        return 'badge bg-purple-transparent text-purple border border-purple-subtle';
      default:
        return 'badge bg-secondary-transparent text-secondary border border-secondary-subtle';
    }
  }

  getItemTypeIcon(itemType: string): string {
    const type = (itemType || '').toLowerCase();
    switch (type) {
      case 'course':
        return 'ri-video-line';
      case 'pdf':
        return 'ri-file-pdf-line';
      case 'audio':
        return 'ri-headphone-line';
      default:
        return 'ri-folder-line';
    }
  }
}

