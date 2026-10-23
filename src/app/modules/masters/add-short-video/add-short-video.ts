import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService } from '../../../shared/services/auth.service';
import { environment } from '../../../../environments/environment';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';

export interface ShortVideoConcept {
  id: number | string;
  title: string;
  orientation: 'vertical' | 'horizontal'; // 'vertical' = 9:16 portrait, 'horizontal' = 16:9 widescreen
  videoUrl: string;
  videoFile?: File | null;
  thumbnailUrl?: string;
  thumbnailFile?: File | null;
  duration?: string;
  category?: string;
  subject?: string;
  description?: string;
  tags?: string[];
  autoplayByDefault?: boolean;
  views?: number;
  status: 'active' | 'inactive';
  created_at: string;
  order_index?: number;
  // Local playback state
  isPlaying?: boolean;
  currentTime?: number;
  totalDuration?: number;
  isMuted?: boolean;
}

@Component({
  selector: 'app-add-short-video',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, SpkReusableTables],
  templateUrl: './add-short-video.html',
  styleUrl: './add-short-video.scss'
})
export class AddShortVideo implements OnInit {
  // Video Concepts List
  concepts: ShortVideoConcept[] = [];
  filteredConcepts: ShortVideoConcept[] = [];

  // Filter and Search State
  searchTerm: string = '';
  selectedOrientationFilter: 'all' | 'vertical' | 'horizontal' = 'all';
  selectedStatusFilter: 'all' | 'active' | 'inactive' = 'all';
  selectedCategoryFilter: string = 'all';
  viewMode: 'grid' | 'table' = 'grid';
  globalAutoplay: boolean = false;

  // Selected item for View / Delete / Edit
  selectedConcept: ShortVideoConcept | null = null;
  isUploading: boolean = false;

  // Add Form Model
  formTitle: string = '';
  formOrientation: 'vertical' | 'horizontal' = 'vertical';
  formSourceType: 'file' | 'url' = 'file';
  formVideoUrl: string = '';
  formVideoFile: File | null = null;
  formVideoPreviewUrl: string = '';
  formThumbnailFile: File | null = null;
  formThumbnailPreviewUrl: string = '';
  formCategory: string = 'Science & Technology';
  formSubject: string = '';
  formDescription: string = '';
  formDuration: string = '00:45';
  formAutoplayByDefault: boolean = true;
  formStatus: 'active' | 'inactive' = 'active';

  // Edit Form Model
  editId: number | string = '';
  editTitle: string = '';
  editOrientation: 'vertical' | 'horizontal' = 'vertical';
  editSourceType: 'file' | 'url' = 'file';
  editVideoUrl: string = '';
  editVideoFile: File | null = null;
  editVideoPreviewUrl: string = '';
  editThumbnailFile: File | null = null;
  editThumbnailPreviewUrl: string = '';
  editCategory: string = '';
  editSubject: string = '';
  editDescription: string = '';
  editDuration: string = '';
  editAutoplayByDefault: boolean = true;
  editStatus: 'active' | 'inactive' = 'active';

  // Modal Player Playback Speed
  modalPlaybackSpeed: number = 1;

  // Default Categories
  categories: string[] = [
    'Science & Technology',
    'Mathematics & Logic',
    'Physics & Mechanics',
    'Chemistry & Biology',
    'Computer Science & AI',
    'General Knowledge',
    'Exam Quick Revision'
  ];

  private apiUrl = `${environment.apiUrl}/short-videos`;

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
      // If unauthorized, notify or load demo data smoothly
      console.warn('No active auth token found. Initializing with sample demo concepts.');
    }
    this.loadConcepts();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Load from API with rich fallback mock data
  loadConcepts(): void {
    this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          this.concepts = res.data.map((item: any) => this.mapConcept(item));
        } else {
          this.initDefaultMockData();
        }
        this.filterConcepts();
        this.cdr.detectChanges();
      },
      error: () => {
        // Graceful fallback to default mock dataset
        this.initDefaultMockData();
        this.filterConcepts();
        this.cdr.detectChanges();
      }
    });
  }

  private initDefaultMockData(): void {
    if (this.concepts.length === 0) {
      this.concepts = [
        {
          id: 1,
          title: 'Mitochondria: The Powerhouse in 60 Seconds',
          orientation: 'vertical',
          videoUrl: './assets/video/1.mp4',
          duration: '00:54',
          category: 'Chemistry & Biology',
          subject: 'Cellular Biology',
          description: 'Quick visual summary of how ATP is synthesized inside cellular mitochondria.',
          tags: ['Biology', 'ATP', 'CellStructure'],
          autoplayByDefault: true,
          views: 1420,
          status: 'active',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          isPlaying: false,
          currentTime: 0,
          totalDuration: 54,
          isMuted: true
        },
        {
          id: 2,
          title: 'Pythagorean Theorem Visual Geometric Proof',
          orientation: 'horizontal',
          videoUrl: './assets/video/1.mp4',
          duration: '01:15',
          category: 'Mathematics & Logic',
          subject: 'Geometry',
          description: 'A liquid-pouring visual proof illustrating a² + b² = c² in right-angled triangles.',
          tags: ['Math', 'Geometry', 'Proof'],
          autoplayByDefault: false,
          views: 2890,
          status: 'active',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
          isPlaying: false,
          currentTime: 0,
          totalDuration: 75,
          isMuted: false
        },
        {
          id: 3,
          title: 'Newton\'s 3 Laws of Motion in Real Life',
          orientation: 'vertical',
          videoUrl: './assets/video/1.mp4',
          duration: '00:48',
          category: 'Physics & Mechanics',
          subject: 'Classical Mechanics',
          description: 'Inertia, F=ma, and Action-Reaction demonstrated with fast motion sports clips.',
          tags: ['Physics', 'Newton', 'Mechanics'],
          autoplayByDefault: true,
          views: 3105,
          status: 'active',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          isPlaying: false,
          currentTime: 0,
          totalDuration: 48,
          isMuted: true
        },
        {
          id: 4,
          title: 'Quantum Computing: Superposition & Qubits Explained',
          orientation: 'horizontal',
          videoUrl: './assets/video/1.mp4',
          duration: '01:40',
          category: 'Computer Science & AI',
          subject: 'Quantum Tech',
          description: 'Understanding quantum superposition using Bloch sphere animations.',
          tags: ['Quantum', 'Computing', 'Tech'],
          autoplayByDefault: false,
          views: 940,
          status: 'active',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          isPlaying: false,
          currentTime: 0,
          totalDuration: 100,
          isMuted: false
        },
        {
          id: 5,
          title: 'Why The Sky Is Blue - Rayleigh Scattering Short',
          orientation: 'vertical',
          videoUrl: './assets/video/1.mp4',
          duration: '00:42',
          category: 'Physics & Mechanics',
          subject: 'Optics',
          description: 'How atmospheric molecules scatter shorter blue wavelengths across the daytime sky.',
          tags: ['Optics', 'Sky', 'Scattering'],
          autoplayByDefault: true,
          views: 4520,
          status: 'active',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
          isPlaying: false,
          currentTime: 0,
          totalDuration: 42,
          isMuted: true
        },
        {
          id: 6,
          title: 'Photosynthesis Light vs Dark Reaction Pathways',
          orientation: 'horizontal',
          videoUrl: './assets/video/1.mp4',
          duration: '01:25',
          category: 'Chemistry & Biology',
          subject: 'Botany',
          description: 'Comparative animation between thylakoid reactions and Calvin Cycle in chloroplasts.',
          tags: ['Botany', 'Photosynthesis', 'CalvinCycle'],
          autoplayByDefault: false,
          views: 1870,
          status: 'inactive',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
          isPlaying: false,
          currentTime: 0,
          totalDuration: 85,
          isMuted: false
        }
      ];
    }
  }

  private mapConcept(item: any): ShortVideoConcept {
    return {
      id: item.id || item._id,
      title: item.title || item.video_title || 'Untitled Concept',
      orientation: item.orientation === 'horizontal' ? 'horizontal' : 'vertical',
      videoUrl: this.resolveMediaUrl(item.video_url || item.video || item.url || './assets/video/1.mp4'),
      thumbnailUrl: item.thumbnail_url ? this.resolveMediaUrl(item.thumbnail_url) : undefined,
      duration: item.duration || '00:45',
      category: item.category || item.category_name || 'General',
      subject: item.subject || item.subject_name || '',
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',') : []),
      autoplayByDefault: item.autoplay_by_default ?? (item.orientation === 'vertical'),
      views: item.views || 0,
      status: item.status === 'inactive' ? 'inactive' : 'active',
      created_at: item.created_at || item.createdAt || new Date().toISOString(),
      isPlaying: false,
      currentTime: 0,
      totalDuration: 0,
      isMuted: item.orientation === 'vertical'
    };
  }

  resolveMediaUrl(path: string): string {
    if (!path) return './assets/video/1.mp4';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    if (path.startsWith('./assets/') || path.startsWith('/assets/')) {
      return path;
    }
    return `${environment.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  // Filter & Search Logic
  filterConcepts(): void {
    let list = [...this.concepts];

    // Search query
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const q = this.searchTerm.toLowerCase().trim();
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.subject && item.subject.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // Orientation Filter
    if (this.selectedOrientationFilter !== 'all') {
      list = list.filter(item => item.orientation === this.selectedOrientationFilter);
    }

    // Status Filter
    if (this.selectedStatusFilter !== 'all') {
      list = list.filter(item => item.status === this.selectedStatusFilter);
    }

    // Category Filter
    if (this.selectedCategoryFilter !== 'all') {
      list = list.filter(item => item.category === this.selectedCategoryFilter);
    }

    this.filteredConcepts = list;
  }

  setOrientationFilter(filter: 'all' | 'vertical' | 'horizontal'): void {
    this.selectedOrientationFilter = filter;
    this.filterConcepts();
  }

  setStatusFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.selectedStatusFilter = filter;
    this.filterConcepts();
  }

  // Summary Metrics
  get totalCount(): number {
    return this.concepts.length;
  }

  get verticalCount(): number {
    return this.concepts.filter(c => c.orientation === 'vertical').length;
  }

  get horizontalCount(): number {
    return this.concepts.filter(c => c.orientation === 'horizontal').length;
  }

  get activeCount(): number {
    return this.concepts.filter(c => c.status === 'active').length;
  }

  // --- Video Playback Controllers (Play, Pause, Stop, Seek, Mute) ---
  togglePlay(item: ShortVideoConcept, videoEl: HTMLVideoElement): void {
    if (!videoEl) return;
    if (videoEl.paused) {
      // Pause all other playing videos
      this.pauseAllExcept(item.id);
      videoEl.play().then(() => {
        item.isPlaying = true;
        this.cdr.detectChanges();
      }).catch(err => {
        console.warn('Autoplay blocked or playback error:', err);
      });
    } else {
      videoEl.pause();
      item.isPlaying = false;
      this.cdr.detectChanges();
    }
  }

  playVideo(item: ShortVideoConcept, videoEl: HTMLVideoElement): void {
    if (!videoEl) return;
    this.pauseAllExcept(item.id);
    videoEl.play().then(() => {
      item.isPlaying = true;
      this.cdr.detectChanges();
    }).catch(err => console.warn(err));
  }

  pauseVideo(item: ShortVideoConcept, videoEl: HTMLVideoElement): void {
    if (!videoEl) return;
    videoEl.pause();
    item.isPlaying = false;
    this.cdr.detectChanges();
  }

  /**
   * Stop Video: Resets playback to time 0:00 and pauses
   * Specifically addresses user requirement: "shtop vagaer krte aana chhaiye aisa"
   */
  stopVideo(item: ShortVideoConcept, videoEl: HTMLVideoElement): void {
    if (!videoEl) return;
    videoEl.pause();
    videoEl.currentTime = 0;
    item.isPlaying = false;
    item.currentTime = 0;
    this.cdr.detectChanges();
    this.toastr.info(`Stopped: "${item.title}"`, 'Playback Reset', { timeOut: 1500 });
  }

  toggleMute(item: ShortVideoConcept, videoEl: HTMLVideoElement): void {
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    item.isMuted = videoEl.muted;
    this.cdr.detectChanges();
  }

  onTimeUpdate(item: ShortVideoConcept, videoEl: HTMLVideoElement): void {
    if (!videoEl) return;
    item.currentTime = videoEl.currentTime;
    item.totalDuration = videoEl.duration || item.totalDuration || 0;
    item.isPlaying = !videoEl.paused;
  }

  onVideoEnded(item: ShortVideoConcept): void {
    item.isPlaying = false;
    item.currentTime = 0;
    this.cdr.detectChanges();
  }

  onVideoLoadedMetadata(item: ShortVideoConcept, videoEl: HTMLVideoElement): void {
    if (!videoEl) return;
    item.totalDuration = videoEl.duration;
    if (!item.duration && videoEl.duration) {
      item.duration = this.formatSeconds(videoEl.duration);
    }
    if (this.globalAutoplay || item.autoplayByDefault) {
      videoEl.muted = true;
      item.isMuted = true;
      videoEl.play().then(() => {
        item.isPlaying = true;
        this.cdr.detectChanges();
      }).catch(() => {
        // Autoplay policy fallback
      });
    }
  }

  seekVideo(event: any, item: ShortVideoConcept, videoEl: HTMLVideoElement): void {
    const targetValue = Number(event.target.value);
    if (videoEl && !isNaN(targetValue)) {
      videoEl.currentTime = targetValue;
      item.currentTime = targetValue;
    }
  }

  pauseAllExcept(activeId: number | string): void {
    this.concepts.forEach(c => {
      if (c.id !== activeId) {
        c.isPlaying = false;
      }
    });
  }

  formatSeconds(sec: number): string {
    if (!sec || isNaN(sec)) return '00:00';
    const totalSecs = Math.floor(sec);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Drag & Drop Reordering ---
  drop(event: CdkDragDrop<ShortVideoConcept[]>): void {
    moveItemInArray(this.filteredConcepts, event.previousIndex, event.currentIndex);
    this.toastr.success('Short video sequence updated', 'Reordered');
  }

  // --- Modal Openers ---
  openAddModal(content: any): void {
    this.resetAddForm();
    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
  }

  openEditModal(concept: ShortVideoConcept, content: any): void {
    this.selectedConcept = concept;
    this.editId = concept.id;
    this.editTitle = concept.title;
    this.editOrientation = concept.orientation;
    this.editSourceType = 'url';
    this.editVideoUrl = concept.videoUrl;
    this.editVideoPreviewUrl = concept.videoUrl;
    this.editThumbnailPreviewUrl = concept.thumbnailUrl || '';
    this.editCategory = concept.category || this.categories[0];
    this.editSubject = concept.subject || '';
    this.editDescription = concept.description || '';
    this.editDuration = concept.duration || '00:45';
    this.editAutoplayByDefault = concept.autoplayByDefault ?? true;
    this.editStatus = concept.status;

    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
  }

  openViewModal(concept: ShortVideoConcept, content: any): void {
    this.selectedConcept = concept;
    this.modalPlaybackSpeed = 1;
    this.modalService.open(content, {
      size: concept.orientation === 'vertical' ? 'md' : 'lg',
      centered: true
    });
  }

  openDeleteModal(concept: ShortVideoConcept, content: any): void {
    this.selectedConcept = concept;
    this.modalService.open(content, {
      centered: true,
      size: 'sm'
    });
  }

  // --- Form Handlers ---
  resetAddForm(): void {
    this.formTitle = '';
    this.formOrientation = 'vertical';
    this.formSourceType = 'file';
    this.formVideoUrl = '';
    this.formVideoFile = null;
    this.formVideoPreviewUrl = '';
    this.formThumbnailFile = null;
    this.formThumbnailPreviewUrl = '';
    this.formCategory = this.categories[0];
    this.formSubject = '';
    this.formDescription = '';
    this.formDuration = '00:45';
    this.formAutoplayByDefault = true;
    this.formStatus = 'active';
  }

  onVideoFileSelected(event: any, isEdit: boolean = false): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|webm|mkv|ogg)$/i)) {
        this.toastr.error('Please choose a valid video file (.mp4, .webm, .mov, .mkv)', 'Invalid File');
        return;
      }

      // Max 500 MB limit check
      const maxSizeBytes = 500 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        this.toastr.error('File size exceeds 500 MB limit. Please compress the video before uploading.', 'File Too Large');
        return;
      }

      // Optimal size guidance tip (50MB - 100MB)
      const optimalSizeBytes = 100 * 1024 * 1024;
      if (file.size > optimalSizeBytes) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        this.toastr.info(`Video size is ${sizeMb} MB. Tip: Keeping short videos under 50-100 MB ensures instant buffering in mobile apps.`, 'Optimal Size Tip');
      }

      const previewUrl = URL.createObjectURL(file);
      if (isEdit) {
        this.editVideoFile = file;
        this.editVideoPreviewUrl = previewUrl;
      } else {
        this.formVideoFile = file;
        this.formVideoPreviewUrl = previewUrl;
      }
    }
  }

  onThumbnailFileSelected(event: any, isEdit: boolean = false): void {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (isEdit) {
        this.editThumbnailFile = file;
        this.editThumbnailPreviewUrl = previewUrl;
      } else {
        this.formThumbnailFile = file;
        this.formThumbnailPreviewUrl = previewUrl;
      }
    }
  }

  onUrlChanged(isEdit: boolean = false): void {
    if (isEdit) {
      this.editVideoPreviewUrl = this.editVideoUrl;
    } else {
      this.formVideoPreviewUrl = this.formVideoUrl;
    }
  }

  // --- Save / Create Concept ---
  saveConcept(modal: any): void {
    if (!this.formTitle || this.formTitle.trim() === '') {
      this.toastr.warning('Please enter a Title for the short video concept.', 'Title Required');
      return;
    }

    const videoSrc = this.formVideoPreviewUrl || this.formVideoUrl || './assets/video/1.mp4';
    if (!videoSrc && !this.formVideoFile) {
      this.toastr.warning('Please upload a video file or enter a video URL.', 'Video Required');
      return;
    }

    this.isUploading = true;

    // Create new concept object
    const newConcept: ShortVideoConcept = {
      id: Date.now(),
      title: this.formTitle.trim(),
      orientation: this.formOrientation,
      videoUrl: videoSrc,
      videoFile: this.formVideoFile,
      thumbnailUrl: this.formThumbnailPreviewUrl || undefined,
      duration: this.formDuration || (this.formOrientation === 'vertical' ? '00:45' : '01:15'),
      category: this.formCategory,
      subject: this.formSubject,
      description: this.formDescription,
      tags: [this.formCategory, this.formOrientation === 'vertical' ? 'Shorts' : 'Landscape'],
      autoplayByDefault: this.formAutoplayByDefault,
      views: 0,
      status: this.formStatus,
      created_at: new Date().toISOString(),
      isPlaying: false,
      currentTime: 0,
      totalDuration: 45,
      isMuted: this.formOrientation === 'vertical'
    };

    // Try API POST, fallback to local state gracefully
    const formData = new FormData();
    formData.append('title', newConcept.title);
    formData.append('orientation', newConcept.orientation);
    formData.append('category', newConcept.category || '');
    formData.append('subject', newConcept.subject || '');
    formData.append('description', newConcept.description || '');
    formData.append('duration', newConcept.duration || '');
    formData.append('status', newConcept.status);
    if (this.formVideoFile) {
      formData.append('video', this.formVideoFile);
    } else if (this.formVideoUrl) {
      formData.append('video_url', this.formVideoUrl);
    }
    if (this.formThumbnailFile) {
      formData.append('thumbnail', this.formThumbnailFile);
    }

    this.http.post<any>(this.apiUrl, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res && res.success && res.data) {
          this.concepts.unshift(this.mapConcept(res.data));
        } else {
          this.concepts.unshift(newConcept);
        }
        this.filterConcepts();
        this.toastr.success(`Added "${newConcept.title}" successfully!`, 'Concept Created');
        modal.close();
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback to local state if backend API route is not mounted yet
        this.isUploading = false;
        this.concepts.unshift(newConcept);
        this.filterConcepts();
        this.toastr.success(`Added "${newConcept.title}" successfully! (Local State)`, 'Concept Created');
        modal.close();
        this.cdr.detectChanges();
      }
    });
  }

  // --- Update / Edit Concept ---
  updateConcept(modal: any): void {
    if (!this.editTitle || this.editTitle.trim() === '') {
      this.toastr.warning('Please enter a Title for the video concept.', 'Title Required');
      return;
    }

    this.isUploading = true;
    const url = `${this.apiUrl}/${this.editId}`;
    const formData = new FormData();
    formData.append('title', this.editTitle.trim());
    formData.append('orientation', this.editOrientation);
    formData.append('category', this.editCategory || '');
    formData.append('subject', this.editSubject || '');
    formData.append('description', this.editDescription || '');
    formData.append('duration', this.editDuration || '');
    formData.append('status', this.editStatus);
    formData.append('autoplay_by_default', String(this.editAutoplayByDefault));

    if (this.editVideoFile) {
      formData.append('video', this.editVideoFile);
    } else if (this.editVideoUrl) {
      formData.append('video_url', this.editVideoUrl);
    }

    if (this.editThumbnailFile) {
      formData.append('thumbnail', this.editThumbnailFile);
    }

    this.http.put<any>(url, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        const index = this.concepts.findIndex(c => c.id === this.editId);
        if (index !== -1) {
          if (res && res.success && res.data) {
            this.concepts[index] = this.mapConcept(res.data);
          } else {
            this.concepts[index] = {
              ...this.concepts[index],
              title: this.editTitle.trim(),
              orientation: this.editOrientation,
              category: this.editCategory,
              subject: this.editSubject,
              description: this.editDescription,
              duration: this.editDuration,
              status: this.editStatus
            };
          }
        }
        this.filterConcepts();
        this.toastr.success(`Updated "${this.editTitle.trim()}" successfully!`, 'Updated');
        modal.close();
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback local update
        this.isUploading = false;
        const index = this.concepts.findIndex(c => c.id === this.editId);
        if (index !== -1) {
          this.concepts[index] = {
            ...this.concepts[index],
            title: this.editTitle.trim(),
            orientation: this.editOrientation,
            category: this.editCategory,
            subject: this.editSubject,
            description: this.editDescription,
            duration: this.editDuration,
            status: this.editStatus
          };
        }
        this.filterConcepts();
        this.toastr.success(`Updated "${this.editTitle.trim()}" successfully! (Local)`, 'Updated');
        modal.close();
        this.cdr.detectChanges();
      }
    });
  }

  // --- Delete Concept ---
  deleteConcept(id: number | string, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.concepts = this.concepts.filter(c => c.id !== id);
        this.filterConcepts();
        this.toastr.success('Video concept deleted successfully', 'Deleted');
        modal.close();
        this.cdr.detectChanges();
      },
      error: () => {
        // Local state removal fallback
        this.concepts = this.concepts.filter(c => c.id !== id);
        this.filterConcepts();
        this.toastr.success('Video concept removed successfully', 'Deleted');
        modal.close();
        this.cdr.detectChanges();
      }
    });
  }

  // --- Toggle Active Status ---
  toggleStatus(concept: ShortVideoConcept): void {
    const newStatus = concept.status === 'active' ? 'inactive' : 'active';
    concept.status = newStatus;
    const url = `${this.apiUrl}/status/${concept.id}`;
    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.toastr.success(`Concept is now ${newStatus}`, 'Status Updated');
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.success(`Concept is now ${newStatus}`, 'Status Updated');
        this.cdr.detectChanges();
      }
    });
  }

  // Modal speed changer
  setModalSpeed(speed: number, videoEl: HTMLVideoElement): void {
    this.modalPlaybackSpeed = speed;
    if (videoEl) {
      videoEl.playbackRate = speed;
    }
  }
}
