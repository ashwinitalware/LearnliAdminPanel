import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-add-language',
  standalone: true,
  imports: [CommonModule, SpkReusableTables, FormsModule, DragDropModule],
  templateUrl: './add-language.html',
  styleUrl: './add-language.scss'
})
export class AddLanguage implements OnInit {
  languages: any[] = [];
  filteredLanguages: any[] = [];
  selectedLanguage: any = null;

  // Search filter
  searchText: string = '';

  // Add Language form bindings
  languageName: string = '';
  status: string = 'active';

  // Edit Language form bindings
  editLanguageName: string = '';
  editStatus: string = 'active';

  isSubmitting: boolean = false;

  private apiUrl = `${environment.apiUrl}/language`;

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
    this.loadLanguages();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadLanguages(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.languages = res.data;
          this.applyFilter();
        } else {
          this.languages = [];
          this.applyFilter();
          this.toastr.error(res.message || 'Failed to load languages', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading languages:', err);
        this.toastr.error('Server error while fetching languages', 'Error');
      }
    });
  }

  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredLanguages = [...this.languages];
    } else {
      const query = this.searchText.toLowerCase().trim();
      this.filteredLanguages = this.languages.filter(
        (item) =>
          item.language_name && item.language_name.toLowerCase().includes(query)
      );
    }
    this.cdr.detectChanges();
  }

  getActiveCount(): number {
    return this.languages.filter(l => l.status === 'active').length;
  }

  getInactiveCount(): number {
    return this.languages.filter(l => l.status === 'inactive').length;
  }

  open(content: any) {
    this.languageName = '';
    this.status = 'active';
    this.isSubmitting = false;

    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  addLanguage(modal: any): void {
    if (!this.languageName.trim()) {
      this.toastr.error('Language name is required', 'Validation Error');
      return;
    }

    const payload = {
      language_name: this.languageName.trim(),
      status: this.status || 'active'
    };

    this.isSubmitting = true;
    this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success(res.message || 'Language created successfully.', 'Success');
          this.loadLanguages();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to add language', 'Error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error adding language:', err);
        this.toastr.error(err.error?.message || 'Server error while adding language', 'Error');
      }
    });
  }

  openEdit(language: any, content: any): void {
    this.selectedLanguage = language;
    this.editLanguageName = language.language_name || '';
    this.editStatus = language.status || 'active';
    this.isSubmitting = false;

    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  updateLanguage(modal: any): void {
    if (!this.editLanguageName.trim()) {
      this.toastr.error('Language name is required', 'Validation Error');
      return;
    }

    const payload = {
      language_name: this.editLanguageName.trim(),
      status: this.editStatus || 'active'
    };

    const url = `${this.apiUrl}/${this.selectedLanguage.id}`;
    this.isSubmitting = true;
    this.http.put<any>(url, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success(res.message || 'Language updated successfully.', 'Success');
          this.loadLanguages();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update language', 'Error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error updating language:', err);
        this.toastr.error(err.error?.message || 'Server error while updating language', 'Error');
      }
    });
  }

  openView(language: any, content: any): void {
    this.selectedLanguage = language;
    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  openDelete(language: any, content: any): void {
    this.selectedLanguage = language;
    this.modalService.open(content, {
      centered: true
    });
  }

  deleteLanguage(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message || 'Language deleted successfully.', 'Success');
          this.loadLanguages();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete language', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting language:', err);
        this.toastr.error(err.error?.message || 'Server error while deleting language', 'Error');
      }
    });
  }

  toggleStatus(language: any): void {
    const newStatus = language.status === 'active' ? 'inactive' : 'active';
    const url = `${this.apiUrl}/status/${language.id}`;

    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message || `Language status updated to ${newStatus}.`, 'Success');
          language.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status', 'Error');
          this.loadLanguages();
        }
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.toastr.error(err.error?.message || 'Server error while changing status', 'Error');
        this.loadLanguages();
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.languages, event.previousIndex, event.currentIndex);
    this.applyFilter();
    this.updateLanguageOrder();
  }

  updateLanguageOrder(): void {
    const order = this.languages.map(lang => lang.id);
    const url = `${this.apiUrl}/reorder`;
    this.http.put<any>(url, { order }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Language order updated successfully', 'Success');
        } else {
          this.toastr.error(res.message || 'Failed to update order', 'Error');
          this.loadLanguages();
        }
      },
      error: (err) => {
        console.error('Error updating order:', err);
        this.toastr.error('Failed to save language order', 'Error');
        this.loadLanguages();
      }
    });
  }
}
