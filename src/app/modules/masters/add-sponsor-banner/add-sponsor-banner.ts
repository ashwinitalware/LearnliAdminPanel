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
  selector: 'app-add-sponsor-banner',
  imports: [SpkReusableTables, FormsModule, DragDropModule],
  templateUrl: './add-sponsor-banner.html',
  styleUrl: './add-sponsor-banner.scss'
})
export class AddSponsorBanner implements OnInit {
  sponsorBanners: any[] = [];
  selectedBanner: any = null;
  isUploading: boolean = false;

  // Add Sponsor Banner form bindings
  title: string = '';
  link: string = '';
  imageFile: File | null = null;
  videoFile: File | null = null;

  // Edit Sponsor Banner form bindings
  editTitle: string = '';
  editLink: string = '';
  editImageFile: File | null = null;
  editVideoFile: File | null = null;

  private apiUrl = `${environment.apiUrl}/sponsor-banner`;

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
    this.loadSponsorBanners();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadSponsorBanners(): void {
    this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.sponsorBanners = res.data || [];
          this.cdr.detectChanges();
        } else {
          this.toastr.error('Failed to load sponsor banners.', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading sponsor banners:', err);
        this.toastr.error('Server error while fetching sponsor banners.', 'Error');
      }
    });
  }

  getSponsorBannerImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.baseUrl}${imagePath}`;
  }

  getSponsorBannerVideoUrl(videoPath: string): string {
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

  addSponsorBanner(modal: any): void {
    if (!this.imageFile && !this.videoFile) {
      this.toastr.error('Either an image file or a video file must be uploaded.', 'Validation Error');
      return;
    }

    this.isUploading = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    if (this.title.trim()) {
      formData.append('title', this.title.trim());
    }
    if (this.link.trim()) {
      formData.append('link', this.link.trim());
    }
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }
    if (this.videoFile) {
      formData.append('video', this.videoFile);
    }

    this.http.post<any>(this.apiUrl, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success) {
          this.toastr.success('Sponsor Banner created successfully.', 'Success');
          this.loadSponsorBanners();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to create sponsor banner.', 'Error');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error creating sponsor banner:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  openEdit(banner: any, content: any): void {
    this.selectedBanner = banner;
    this.editTitle = banner.title || '';
    this.editLink = banner.link || '';
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

  updateSponsorBanner(modal: any): void {
    this.isUploading = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('title', this.editTitle.trim());
    formData.append('link', this.editLink.trim());

    if (this.editImageFile) {
      formData.append('image', this.editImageFile);
    }
    if (this.editVideoFile) {
      formData.append('video', this.editVideoFile);
    }

    const url = `${this.apiUrl}/${this.selectedBanner.id}`;
    this.http.put<any>(url, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success) {
          this.toastr.success('Sponsor Banner updated successfully.', 'Success');
          this.loadSponsorBanners();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update sponsor banner.', 'Error');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error updating sponsor banner:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  openView(banner: any, content: any): void {
    this.selectedBanner = banner;
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  openDelete(banner: any, content: any): void {
    this.selectedBanner = banner;
    this.modalService.open(content, {
      centered: true
    });
  }

  deleteSponsorBanner(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Sponsor Banner deleted successfully.', 'Success');
          this.loadSponsorBanners();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete sponsor banner.', 'Error');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error deleting sponsor banner:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(banner: any): void {
    const newStatus = banner.status === 'active' ? 'inactive' : 'active';
    const url = `${this.apiUrl}/status/${banner.id}`;

    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Sponsor Banner is now ${newStatus}.`, 'Success');
          banner.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status.', 'Error');
          this.loadSponsorBanners();
        }
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.toastr.error(err.error?.message || 'Server error', 'Error');
        this.loadSponsorBanners();
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.sponsorBanners, event.previousIndex, event.currentIndex);
    this.updateSponsorBannerOrder();
  }

  updateSponsorBannerOrder(): void {
    const order = this.sponsorBanners.map(banner => banner.id);
    const url = `${this.apiUrl}/reorder`;
    this.http.put<any>(url, { order }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Sponsor Banner order updated successfully', 'Success');
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update order', 'Error');
          this.loadSponsorBanners();
        }
      },
      error: (err) => {
        console.error('Error updating order:', err);
        this.toastr.error('Failed to save sponsor banner order', 'Error');
        this.loadSponsorBanners();
      }
    });
  }
}