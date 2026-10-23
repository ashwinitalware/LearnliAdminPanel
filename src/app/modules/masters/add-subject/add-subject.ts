import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';

@Component({
  selector: 'app-add-subject',
  imports: [SpkReusableTables, FormsModule, DatePipe],
  templateUrl: './add-subject.html',
  styleUrl: './add-subject.scss'
})
export class AddSubject implements OnInit {
  categories: any[] = [];
  subcategories: any[] = [];
  subjects: any[] = [];
  selectedSubject: any = null;

  // Add Form
  categoryId: number | null = null;
  subcategoryId: number | null = null;
  subjectName: string = '';
  filteredSubcategories: any[] = [];

  // Edit Form
  editCategoryId: number | null = null;
  editSubcategoryId: number | null = null;
  editSubjectName: string = '';
  editFilteredSubcategories: any[] = [];

  // Filter and Search Header Bindings
  selectedFilterCategory: any = null;
  selectedFilterSubcategory: any = null;
  filterSubcategories: any[] = [];
  searchText: string = '';
  filteredSubjects: any[] = [];

  private apiUrl = `${environment.apiUrl}/subject`;
  private categoryApiUrl = `${environment.apiUrl}/category`;
  private subcategoryApiUrl = `${environment.apiUrl}/subcategory`;

  constructor(
    private modalService: NgbModal,
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastr.warning('Please log in first.', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadCategories();
    this.loadSubcategories();
    this.loadSubjects();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadCategories(): void {
    this.http.get<any>(this.categoryApiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadSubcategories(): void {
    this.http.get<any>(this.subcategoryApiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.subcategories = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
      }
    });
  }

  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredSubjects = [...this.subjects];
      this.cdr.detectChanges();
      return;
    }
    const query = this.searchText.toLowerCase().trim();
    this.filteredSubjects = this.subjects.filter(subject => 
      (subject.subject_name && subject.subject_name.toLowerCase().includes(query)) ||
      (subject.category_name && subject.category_name.toLowerCase().includes(query)) ||
      (subject.subcategory_name && subject.subcategory_name.toLowerCase().includes(query))
    );
    this.cdr.detectChanges();
  }

  loadSubjects(): void {
    let params: any = {};
    if (this.selectedFilterCategory) {
      params.categoryId = this.selectedFilterCategory;
    }
    if (this.selectedFilterSubcategory) {
      params.subcategoryId = this.selectedFilterSubcategory;
    }

    this.http.get<any>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        if (res.success) {
          this.subjects = res.data;
          this.applyFilter();
        }
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.toastr.error('Failed to load subjects from backend server.', 'Error');
      }
    });
  }

  onFilterCategoryChange(): void {
    this.selectedFilterSubcategory = null;
    if (this.selectedFilterCategory) {
      this.filterSubcategories = this.subcategories.filter(
        (sub) => Number(sub.category_id) === Number(this.selectedFilterCategory)
      );
    } else {
      this.filterSubcategories = [];
    }
    this.loadSubjects();
  }

  onCategoryChange(): void {
    this.subcategoryId = null;
    if (this.categoryId) {
      // String or Number check
      this.filteredSubcategories = this.subcategories.filter(
        (sub) => Number(sub.category_id) === Number(this.categoryId)
      );
    } else {
      this.filteredSubcategories = [];
    }
  }

  onEditCategoryChange(): void {
    this.editSubcategoryId = null;
    if (this.editCategoryId) {
      this.editFilteredSubcategories = this.subcategories.filter(
        (sub) => Number(sub.category_id) === Number(this.editCategoryId)
      );
    } else {
      this.editFilteredSubcategories = [];
    }
  }

  open(content: any) {
    setTimeout(() => {
      this.categoryId = null;
      this.subcategoryId = null;
      this.subjectName = '';
      this.filteredSubcategories = [];

      this.modalService.open(content, {
        centered: true,
        size: 'lg'
      });
    });
  }

  addSubject(modal: any): void {
    if (!this.categoryId) {
      this.toastr.error('Please select a category', 'Validation Error');
      return;
    }
    if (!this.subcategoryId) {
      this.toastr.error('Please select a subcategory', 'Validation Error');
      return;
    }
    if (!this.subjectName.trim()) {
      this.toastr.error('Subject name is required', 'Validation Error');
      return;
    }

    const payload = {
      category_id: this.categoryId,
      subcategory_id: this.subcategoryId,
      subject_name: this.subjectName.trim()
    };

    this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Subject added successfully', 'Success');
          this.loadSubjects();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to add subject', 'Error');
        }
      },
      error: (err) => {
        console.error('Error adding subject:', err);
        this.toastr.error(err.error?.message || 'Server error while adding subject', 'Error');
      }
    });
  }

  openEdit(subject: any, content: any): void {
    setTimeout(() => {
      this.selectedSubject = subject;
      this.editCategoryId = subject.category_id;
      this.editFilteredSubcategories = this.subcategories.filter(
        (sub) => Number(sub.category_id) === Number(this.editCategoryId)
      );
      this.editSubcategoryId = subject.subcategory_id;
      this.editSubjectName = subject.subject_name;

      this.modalService.open(content, {
        centered: true,
        size: 'lg'
      });
    });
  }

  updateSubject(modal: any): void {
    if (!this.editCategoryId) {
      this.toastr.error('Please select a category', 'Validation Error');
      return;
    }
    if (!this.editSubcategoryId) {
      this.toastr.error('Please select a subcategory', 'Validation Error');
      return;
    }
    if (!this.editSubjectName.trim()) {
      this.toastr.error('Subject name is required', 'Validation Error');
      return;
    }

    const payload = {
      category_id: this.editCategoryId,
      subcategory_id: this.editSubcategoryId,
      subject_name: this.editSubjectName.trim()
    };

    const url = `${this.apiUrl}/${this.selectedSubject.id}`;
    this.http.put<any>(url, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Subject updated successfully', 'Success');
          this.loadSubjects();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update subject', 'Error');
        }
      },
      error: (err) => {
        console.error('Error updating subject:', err);
        this.toastr.error(err.error?.message || 'Server error while updating subject', 'Error');
      }
    });
  }

  openView(subject: any, content: any): void {
    setTimeout(() => {
      this.selectedSubject = subject;
      this.modalService.open(content, {
        centered: true,
        size: 'lg'
      });
    });
  }

  openDelete(subject: any, content: any): void {
    setTimeout(() => {
      this.selectedSubject = subject;
      this.modalService.open(content, {
        centered: true
      });
    });
  }

  deleteSubject(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Subject deleted successfully', 'Success');
          this.loadSubjects();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete subject', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting subject:', err);
        this.toastr.error(err.error?.message || 'Server error while deleting subject', 'Error');
      }
    });
  }

  toggleStatus(subject: any): void {
    const newStatus = subject.status === 'active' ? 'inactive' : 'active';
    const url = `${this.apiUrl}/status/${subject.id}`;

    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Subject is now ${newStatus}`, 'Success');
          subject.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status', 'Error');
          this.loadSubjects();
        }
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.toastr.error(err.error?.message || 'Server error while changing status', 'Error');
      }
    });
  }
}
