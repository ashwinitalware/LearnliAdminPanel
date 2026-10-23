import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { environment } from '../../../../environments/environment';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-add-slider',
  imports: [SpkReusableTables, FormsModule, DragDropModule],
  templateUrl: './add-slider.html',
  styleUrl: './add-slider.scss'
})
export class AddSlider implements OnInit {
  sliders: any[] = [];
  selectedSlider: any = null;
  isUploading: boolean = false;

  // Add Slider form bindings
  title: string = '';
  link: string = '';
  mediaType: 'image' | 'video' = 'image';
  imageFile: File | null = null;
  videoFile: File | null = null;

  // Edit Slider form bindings
  editTitle: string = '';
  editLink: string = '';
  editMediaType: 'image' | 'video' = 'image';
  editImageFile: File | null = null;
  editVideoFile: File | null = null;

  private apiUrl = `${environment.apiUrl}/slider`;

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
    this.loadSliders();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadSliders(): void {
    this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.sliders = res.data || [];
          this.cdr.detectChanges();
        } else {
          this.toastr.error('Failed to load sliders', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading sliders:', err);
        this.toastr.error('Server error while fetching sliders', 'Error');
      }
    });
  }

  getSliderImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.baseUrl}${imagePath}`;
  }

  getSliderVideoUrl(videoPath: string): string {
    if (!videoPath) return '';
    if (videoPath.startsWith('http')) return videoPath;
    return `${environment.baseUrl}${videoPath}`;
  }

  getFileName(filePath: string): string {
    if (!filePath) return '';
    return filePath.substring(filePath.lastIndexOf('/') + 1);
  }

  open(content: any) {
    this.title = '';
    this.link = '';
    this.mediaType = 'image';
    this.imageFile = null;
    this.videoFile = null;

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

  onVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.videoFile = file;
    }
  }

  addSlider(modal: any): void {
    if (this.mediaType === 'image' && !this.imageFile) {
      this.toastr.error('Slider image file is required.', 'Validation Error');
      return;
    }
    if (this.mediaType === 'video' && !this.videoFile) {
      this.toastr.error('Slider video file is required.', 'Validation Error');
      return;
    }

    this.isUploading = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('mediaType', this.mediaType);

    if (this.title.trim()) {
      formData.append('title', this.title.trim());
    }
    if (this.link.trim()) {
      formData.append('link', this.link.trim());
    }
    if (this.mediaType === 'image' && this.imageFile) {
      formData.append('image', this.imageFile);
    }
    if (this.mediaType === 'video' && this.videoFile) {
      formData.append('video', this.videoFile);
    }

    this.http.post<any>(this.apiUrl, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success) {
          this.toastr.success('Slider created successfully.', 'Success');
          this.loadSliders();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to create slider.', 'Error');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error creating slider:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  openEdit(slider: any, content: any): void {
    this.selectedSlider = slider;
    this.editTitle = slider.title || '';
    this.editLink = slider.link || '';
    this.editMediaType = slider.video ? 'video' : 'image';
    this.editImageFile = null;
    this.editVideoFile = null;

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

  onEditVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editVideoFile = file;
    }
  }

  updateSlider(modal: any): void {
    if (this.editMediaType === 'image' && !this.editImageFile && !this.selectedSlider.image) {
      this.toastr.error('Slider image file is required.', 'Validation Error');
      return;
    }
    if (this.editMediaType === 'video' && !this.editVideoFile && !this.selectedSlider.video) {
      this.toastr.error('Slider video file is required.', 'Validation Error');
      return;
    }

    this.isUploading = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('mediaType', this.editMediaType);
    formData.append('title', this.editTitle.trim());
    formData.append('link', this.editLink.trim());

    if (this.editMediaType === 'image' && this.editImageFile) {
      formData.append('image', this.editImageFile);
    }
    if (this.editMediaType === 'video' && this.editVideoFile) {
      formData.append('video', this.editVideoFile);
    }

    const url = `${this.apiUrl}/${this.selectedSlider.id}`;
    this.http.put<any>(url, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success) {
          this.toastr.success('Slider updated successfully.', 'Success');
          this.loadSliders();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update slider.', 'Error');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error updating slider:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  openView(slider: any, content: any): void {
    this.selectedSlider = slider;
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  openDelete(slider: any, content: any): void {
    this.selectedSlider = slider;
    this.modalService.open(content, {
      centered: true
    });
  }

  deleteSlider(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Slider deleted successfully.', 'Success');
          this.loadSliders();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete slider.', 'Error');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error deleting slider:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(slider: any): void {
    const newStatus = slider.status === 'active' ? 'inactive' : 'active';
    const url = `${this.apiUrl}/status/${slider.id}`;

    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Slider is now ${newStatus}.`, 'Success');
          slider.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status.', 'Error');
          this.loadSliders();
        }
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.loadSliders();
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.sliders, event.previousIndex, event.currentIndex);
    this.updateSliderOrder();
  }

  updateSliderOrder(): void {
    const order = this.sliders.map(slide => slide.id);
    const url = `${this.apiUrl}/reorder`;
    this.http.put<any>(url, { order }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Slider order updated successfully', 'Success');
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update order', 'Error');
          this.loadSliders();
        }
      },
      error: (err) => {
        console.error('Error updating order:', err);
        this.toastr.error('Failed to save slider order', 'Error');
        this.loadSliders();
      }
    });
  }
}