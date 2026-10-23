import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  expandedOrderId: any = null; // tracking expanded order
  
  // Filters
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedItemType: string = '';
  
  // State
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
    
    this.loadOrders();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadOrders(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/admin/orders`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success || Array.isArray(res.data)) {
          this.orders = res.data || [];
          this.applyFilters();
        } else {
          this.orders = [];
          this.filteredOrders = [];
          this.toastr.error(res.message || 'Failed to fetch orders', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.orders = [];
        this.filteredOrders = [];
        console.error('Error loading orders:', err);
        this.toastr.error('Failed to load orders history', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(orderId: any): void {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
    } else {
      this.expandedOrderId = orderId;
    }
  }

  applyFilters(): void {
    let tempOrders = [...this.orders];
    
    // Status Filter
    if (this.selectedStatus) {
      tempOrders = tempOrders.filter(o => {
        const status = (o.payment_status || o.status || '').toLowerCase();
        return status === this.selectedStatus.toLowerCase();
      });
    }

    // Item Type Filter
    if (this.selectedItemType) {
      tempOrders = tempOrders.filter(o => {
        const items = o.items || [];
        return items.some((item: any) => (item.item_type || '').toLowerCase() === this.selectedItemType.toLowerCase());
      });
    }

    // Search Term Filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      tempOrders = tempOrders.filter(o => {
        const orderIdStr = String(o.order_id || o.id || '').toLowerCase();
        const txnIdStr = String(o.transaction_id || o.txn_id || '').toLowerCase();
        const studentName = this.getStudentName(o).toLowerCase();
        const studentEmail = this.getStudentEmail(o).toLowerCase();
        const studentMobile = this.getStudentMobile(o).toLowerCase();
        const paymentMethod = String(o.payment_method || '').toLowerCase();
        
        const hasMatchingItem = (o.items || []).some((item: any) => {
          const title = (item.title || item.course_name || item.name || '').toLowerCase();
          const mentor = (item.mentor_name || '').toLowerCase();
          const type = (item.item_type || '').toLowerCase();
          return title.includes(term) || mentor.includes(term) || type.includes(term);
        });

        return orderIdStr.includes(term) ||
               txnIdStr.includes(term) ||
               studentName.includes(term) ||
               studentEmail.includes(term) ||
               studentMobile.includes(term) ||
               paymentMethod.includes(term) ||
               hasMatchingItem;
      });
    }

    this.filteredOrders = tempOrders;
  }

  // Safe helper getters for data binding
  getOrderId(order: any): string {
    return String(order.order_id || order.id || 'N/A');
  }

  getTransactionId(order: any): string {
    return order.transaction_id || order.txn_id || '';
  }

  getStudentName(order: any): string {
    return order.student?.full_name || order.student?.name || order.student_name || order.user?.name || 'Unknown Student';
  }

  getStudentEmail(order: any): string {
    return order.student?.email || order.student_email || order.user?.email || 'N/A';
  }

  getStudentMobile(order: any): string {
    return order.student?.mobile || order.student_mobile || order.user?.mobile || '';
  }

  getTotalAmount(order: any): number {
    return Number(order.total_amount || order.grand_total || 0);
  }

  getOrderStatus(order: any): string {
    return order.payment_status || order.status || 'completed';
  }

  getStatusBadgeClass(status: string): string {
    status = (status || '').toLowerCase();
    switch (status) {
      case 'completed':
      case 'success':
      case 'paid':
        return 'bg-success-transparent text-success border border-success-subtle';
      case 'pending':
      case 'processing':
        return 'bg-warning-transparent text-warning border border-warning-subtle';
      case 'failed':
      case 'cancelled':
        return 'bg-danger-transparent text-danger border border-danger-subtle';
      default:
        return 'bg-light text-dark border border-gray-subtle';
    }
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

  getItemTitle(item: any): string {
    return item.title || item.course_name || item.name || 'Untitled Item';
  }

  getPaymentMethodBadgeClass(method: string): string {
    const m = (method || '').toLowerCase();
    switch (m) {
      case 'wallet':
        return 'badge bg-info-transparent text-info border border-info-subtle';
      case 'upi':
        return 'badge bg-success-transparent text-success border border-success-subtle';
      case 'razorpay':
      case 'card':
        return 'badge bg-primary-transparent text-primary border border-primary-subtle';
      default:
        return 'badge bg-light text-muted border';
    }
  }
}

