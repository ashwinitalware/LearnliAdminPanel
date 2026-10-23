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
  selector: 'app-add-category',
  imports: [SpkReusableTables, FormsModule, DatePipe, DragDropModule],
  templateUrl: './add-category.html',
  styleUrl: './add-category.scss'
})
export class AddCategory implements OnInit {
  categories: any[] = [];
  selectedCategory: any = null;

  // Add Category form bindings
  categoryName: string = '';
  imageFile: File | null = null;

  // Edit Category form bindings
  editCategoryName: string = '';
  editImageFile: File | null = null;

  private apiUrl = `${environment.apiUrl}/category`;

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
  }



  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`)
                       .set('X-Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadCategories(): void {
    this.http.get<any>(this.apiUrl).subscribe({
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

  getCategoryImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/images/media/media-1.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.baseUrl}${imagePath}`;
  }

  open(content: any) {
    // Reset add form
    this.categoryName = '';
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

  addCategory(modal: any): void {
    if (!this.categoryName.trim()) {
      this.toastr.error('Category name is required', 'Validation Error');
      return;
    }

    const formData = new FormData();
    formData.append('category_name', this.categoryName.trim());
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.http.post<any>(this.apiUrl, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Category added successfully', 'Success');
          this.loadCategories();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to add category', 'Error');
        }
      },
      error: (err) => {
        console.error('Error adding category:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  openEdit(category: any, content: any): void {
    this.selectedCategory = category;
    this.editCategoryName = category.category_name;
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

  updateCategory(modal: any): void {
    if (!this.editCategoryName.trim()) {
      this.toastr.error('Category name is required', 'Validation Error');
      return;
    }

    const formData = new FormData();
    formData.append('category_name', this.editCategoryName.trim());
    if (this.editImageFile) {
      formData.append('image', this.editImageFile);
    }

    const url = `${this.apiUrl}/${this.selectedCategory.id}`;
    this.http.put<any>(url, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Category updated successfully', 'Success');
          this.loadCategories();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update category', 'Error');
        }
      },
      error: (err) => {
        console.error('Error updating category:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  openView(category: any, content: any): void {
    this.selectedCategory = category;
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  openDelete(category: any, content: any): void {
    this.selectedCategory = category;
    this.modalService.open(content, {
      centered: true
    });
  }

  deleteCategory(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Category deleted successfully', 'Success');
          this.loadCategories();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete category', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
      }
    });
  }

  toggleStatus(category: any): void {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    const url = `${this.apiUrl}/status/${category.id}`;

    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Category is now ${newStatus}`, 'Success');
          category.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status', 'Error');
          this.loadCategories();
        }
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.loadCategories();
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    this.updateCategoryOrder();
  }

  updateCategoryOrder(): void {
    const order = this.categories.map(cat => cat.id);
    const url = `${this.apiUrl}/reorder`;
    this.http.put<any>(url, { order }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Category order updated successfully', 'Success');
        } else {
          this.toastr.error(res.message || 'Failed to update order', 'Error');
          this.loadCategories();
        }
      },
      error: (err) => {
        console.error('Error updating order:', err);
        this.toastr.error('Failed to save category order', 'Error');
        this.loadCategories();
      }
    });
  }
}