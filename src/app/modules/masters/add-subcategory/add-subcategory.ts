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
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-add-subcategory',
  imports: [SpkReusableTables, FormsModule, DatePipe, DragDropModule],
  templateUrl: './add-subcategory.html',
  styleUrl: './add-subcategory.scss'
})
export class AddSubcategory implements OnInit {
  categories: any[] = [];
  subcategories: any[] = [];
  selectedSubcategory: any = null;

  // Add Form
  categoryId: number | null = null;
  subcategoryName: string = '';
  imageFile: File | null = null;

  // Edit Form
  editCategoryId: number | null = null;
  editSubcategoryName: string = '';
  editImageFile: File | null = null;

  private apiUrl = `${environment.apiUrl}/subcategory`;
  private categoryApiUrl = `${environment.apiUrl}/category`;

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
        } else {
          this.toastr.error('Failed to load categories', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.toastr.error('Server error while fetching categories', 'Error');
      }
    });
  }

  loadSubcategories(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.subcategories = res.data;
          this.cdr.detectChanges();
        } else {
          this.toastr.error('Failed to load subcategories', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
        this.toastr.error('Server error while fetching subcategories', 'Error');
      }
    });
  }

  getSubcategoryImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/images/media/media-1.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.baseUrl}${imagePath}`;
  }

  open(content: any) {
    this.categoryId = null;
    this.subcategoryName = '';
    this.imageFile = null;

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }

  addSubcategory(modal: any): void {
    if (!this.categoryId) {
      this.toastr.error('Please select a parent category', 'Validation Error');
      return;
    }
    if (!this.subcategoryName.trim()) {
      this.toastr.error('Subcategory name is required', 'Validation Error');
      return;
    }

    const formData = new FormData();
    formData.append('category_id', String(this.categoryId));
    formData.append('subcategory_name', this.subcategoryName.trim());
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.http.post<any>(this.apiUrl, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Subcategory added successfully', 'Success');
          this.loadSubcategories();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to add subcategory', 'Error');
        }
      },
      error: (err) => {
        console.error('Error adding subcategory:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  openEdit(subcategory: any, content: any): void {
    this.selectedSubcategory = subcategory;
    this.editCategoryId = subcategory.category_id;
    this.editSubcategoryName = subcategory.subcategory_name;
    this.editImageFile = null;

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editImageFile = file;
    }
  }

  updateSubcategory(modal: any): void {
    if (!this.editCategoryId) {
      this.toastr.error('Please select a parent category', 'Validation Error');
      return;
    }
    if (!this.editSubcategoryName.trim()) {
      this.toastr.error('Subcategory name is required', 'Validation Error');
      return;
    }

    const formData = new FormData();
    formData.append('category_id', String(this.editCategoryId));
    formData.append('subcategory_name', this.editSubcategoryName.trim());
    if (this.editImageFile) {
      formData.append('image', this.editImageFile);
    }

    const url = `${this.apiUrl}/${this.selectedSubcategory.id}`;
    this.http.put<any>(url, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Subcategory updated successfully', 'Success');
          this.loadSubcategories();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update subcategory', 'Error');
        }
      },
      error: (err) => {
        console.error('Error updating subcategory:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  openView(subcategory: any, content: any): void {
    this.selectedSubcategory = subcategory;
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  openDelete(subcategory: any, content: any): void {
    this.selectedSubcategory = subcategory;
    this.modalService.open(content, {
      centered: true
    });
  }

  deleteSubcategory(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Subcategory deleted successfully', 'Success');
          this.loadSubcategories();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete subcategory', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting subcategory:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  toggleStatus(subcategory: any): void {
    const newStatus = subcategory.status === 'active' ? 'inactive' : 'active';
    const url = `${this.apiUrl}/status/${subcategory.id}`;

    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Subcategory is now ${newStatus}`, 'Success');
          subcategory.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status', 'Error');
          this.loadSubcategories();
        }
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.loadSubcategories();
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.subcategories, event.previousIndex, event.currentIndex);
    this.updateSubcategoryOrder();
  }

  updateSubcategoryOrder(): void {
    const order = this.subcategories.map(sub => sub.id);
    const url = `${this.apiUrl}/reorder`;
    this.http.put<any>(url, { order }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Subcategory order updated successfully', 'Success');
        } else {
          this.toastr.error(res.message || 'Failed to update order', 'Error');
          this.loadSubcategories();
        }
      },
      error: (err) => {
        console.error('Error updating order:', err);
        this.toastr.error('Failed to save subcategory order', 'Error');
        this.loadSubcategories();
      }
    });
  }
}
