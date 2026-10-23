import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-notification',
  imports: [SpkReusableTables, FormsModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss'
})
export class Notification implements OnInit {
  notifications: any[] = [];
  selectedNotification: any = null;

  // Add Notification bindings
  title: string = '';
  description: string = '';

  // Edit Notification bindings
  editTitle: string = '';
  editDescription: string = '';

  private apiUrl = `${environment.apiUrl}/notification`;

  constructor(
    private modalService: NgbModal,
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
    this.loadNotifications();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadNotifications(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications = res.data;
          this.cdr.detectChanges(); // Trigger change detection
        } else {
          this.toastr.error('Failed to load notifications.', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.toastr.error('Server error while fetching notifications.', 'Error');
      }
    });
  }

  open(content: any) {
    this.title = '';
    this.description = '';

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  addNotification(modal: any): void {
    if (!this.title.trim() || !this.description.trim()) {
      this.toastr.error('Title and description are required.', 'Validation Error');
      return;
    }

    const payload = {
      title: this.title.trim(),
      description: this.description.trim()
    };

    this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Notification created successfully.', 'Success');
          this.loadNotifications();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to create notification.', 'Error');
        }
      },
      error: (err) => {
        console.error('Error creating notification:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  openEdit(notification: any, content: any): void {
    this.selectedNotification = notification;
    this.editTitle = notification.title || '';
    this.editDescription = notification.description || '';

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  updateNotification(modal: any): void {
    if (!this.editTitle.trim() || !this.editDescription.trim()) {
      this.toastr.error('Title and description are required.', 'Validation Error');
      return;
    }

    const payload = {
      title: this.editTitle.trim(),
      description: this.editDescription.trim()
    };

    const url = `${this.apiUrl}/${this.selectedNotification.id}`;
    this.http.put<any>(url, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Notification updated successfully.', 'Success');
          this.loadNotifications();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update notification.', 'Error');
        }
      },
      error: (err) => {
        console.error('Error updating notification:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  openView(notification: any, content: any): void {
    this.selectedNotification = notification;
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  openDelete(notification: any, content: any): void {
    this.selectedNotification = notification;
    this.modalService.open(content, {
      centered: true
    });
  }

  deleteNotification(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Notification deleted successfully.', 'Success');
          this.loadNotifications();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete notification.', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting notification:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  toggleStatus(notification: any): void {
    const newStatus = notification.status === 'active' ? 'inactive' : 'active';
    const url = `${this.apiUrl}/status/${notification.id}`;

    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Notification status updated to ${newStatus}.`, 'Success');
          notification.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status.', 'Error');
          this.loadNotifications();
        }
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.loadNotifications();
      }
    });
  }
}