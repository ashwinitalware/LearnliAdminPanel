import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit {
  carts: any[] = [];
  filteredCarts: any[] = [];
  mentors: any[] = [];
  
  // Filters
  selectedMentorId: any = '';
  searchTerm: string = '';
  
  // User info
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
    this.loadCarts();
    
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

  loadCarts(): void {
    this.isLoading = true;
    let url = `${environment.apiUrl}/admin/cart`;
    
    // Admin mentor filtering
    if (this.userRole === 'admin' && this.selectedMentorId) {
      url += `?mentor_id=${this.selectedMentorId}`;
    }

    this.http.get<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success || Array.isArray(res.data)) {
          this.carts = res.data || [];
          this.applyFilters();
        } else {
          this.carts = [];
          this.filteredCarts = [];
          this.toastr.error(res.message || 'Failed to fetch carts', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.carts = [];
        this.filteredCarts = [];
        console.error('Error loading carts:', err);
        this.toastr.error('Failed to load active carts list', 'Error');
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
    if (!this.searchTerm.trim()) {
      this.filteredCarts = [...this.carts];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCarts = this.carts.filter(item => {
        const studentName = (item.student_name || item.user?.name || item.student?.name || '').toLowerCase();
        const studentEmail = (item.student_email || item.user?.email || item.student?.email || '').toLowerCase();
        const courseName = (item.course_name || item.course?.course_name || '').toLowerCase();
        const mentorName = (item.mentor_name || item.course?.mentor?.name || '').toLowerCase();

        return studentName.includes(term) ||
               studentEmail.includes(term) ||
               courseName.includes(term) ||
               mentorName.includes(term);
      });
    }
  }

  onFilterChange(): void {
    this.loadCarts();
  }

  // Helper getters to support multiple data structures safely
  getStudentName(item: any): string {
    return item.student_name || item.user?.name || item.student?.name || 'N/A';
  }

  getStudentEmail(item: any): string {
    return item.student_email || item.user?.email || item.student?.email || 'N/A';
  }

  getCourseName(item: any): string {
    return item.course_name || item.course?.course_name || 'N/A';
  }

  getCoursePrice(item: any): number {
    return item.price || item.course?.price || 0;
  }
}
