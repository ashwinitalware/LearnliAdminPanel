import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
  LiveClassService,
  LiveClass,
  LiveClassStatus,
  MentorOption,
  SubjectOption,
  PaginationMeta
} from '../live-class.service';

@Component({
  selector: 'app-live-class-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbPaginationModule, DatePipe],
  templateUrl: './live-class-list.component.html',
  styleUrl: './live-class-list.component.scss'
})
export class LiveClassListComponent implements OnInit {
  @ViewChild('deleteConfirmModal') deleteConfirmModalRef!: TemplateRef<any>;
  @ViewChild('statusConfirmModal') statusConfirmModalRef!: TemplateRef<any>;

  classes: LiveClass[] = [];
  mentors: MentorOption[] = [];
  subjects: SubjectOption[] = [];
  isLoading: boolean = false;

  // Filter criteria
  searchTerm: string = '';
  selectedMentorId: any = 'all';
  selectedSubject: string = 'all';
  selectedStatus: string = 'all';
  selectedClassType: string = 'all';
  dateFrom: string = '';
  dateTo: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 1;

  // Modals state
  selectedClassForDelete: LiveClass | null = null;
  selectedClassForStatus: LiveClass | null = null;
  targetStatus: LiveClassStatus | null = null;
  isActionSubmitting: boolean = false;

  private searchDebounceTimer: any;

  constructor(
    private liveClassService: LiveClassService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Read optional query param filter e.g. ?status=ongoing
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.selectedStatus = params['status'];
      }
      this.loadMetadata();
      this.loadClasses();
    });
  }

  loadMetadata(): void {
    this.liveClassService.getMentors().subscribe(mentors => {
      this.mentors = mentors;
      this.cdr.detectChanges();
    });

    this.liveClassService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
      this.cdr.detectChanges();
    });
  }

  loadClasses(): void {
    this.isLoading = true;
    this.liveClassService.getLiveClasses({
      search: this.searchTerm,
      mentor_id: this.selectedMentorId !== 'all' ? Number(this.selectedMentorId) : undefined,
      subject: this.selectedSubject !== 'all' ? this.selectedSubject : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      class_type: this.selectedClassType !== 'all' ? this.selectedClassType : undefined,
      date_from: this.dateFrom ? this.dateFrom : undefined,
      date_to: this.dateTo ? this.dateTo : undefined,
      page: this.currentPage,
      limit: this.pageSize
    }).subscribe({
      next: (res) => {
        this.classes = res.data || [];
        if (res.pagination) {
          this.totalCount = res.pagination.total;
          this.currentPage = res.pagination.page;
          this.pageSize = res.pagination.limit;
          this.totalPages = res.pagination.totalPages;
        } else {
          this.totalCount = this.classes.length;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching live classes:', err);
        this.toastr.error('Failed to load live classes roster.', 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage = 1;
      this.loadClasses();
    }, 400);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadClasses();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedMentorId = 'all';
    this.selectedSubject = 'all';
    this.selectedStatus = 'all';
    this.selectedClassType = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.loadClasses();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadClasses();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadClasses();
  }

  getThumbnail(path: string | null | undefined): string {
    if (!path) return 'assets/images/media/media-48.jpg';
    return this.liveClassService.getAssetUrl(path);
  }

  getMentorPhoto(photo: string | null | undefined): string {
    if (!photo) return 'assets/images/faces/9.jpg';
    return this.liveClassService.getAssetUrl(photo);
  }

  isDiscounted(item: LiveClass): boolean {
    const discounted = item.pricing?.discounted_fees || 0;
    const regular = item.pricing?.fees || 0;
    return discounted > 0 && discounted < regular;
  }

  getEffectiveFee(item: LiveClass): number {
    return item.pricing?.effective_fee ?? (item.pricing?.discounted_fees || item.pricing?.fees || 0);
  }

  isFree(item: LiveClass): boolean {
    return !!(item.pricing?.is_free || this.getEffectiveFee(item) === 0);
  }

  getEnrolledCount(item: LiveClass): number {
    return item.capacity?.enrolled_count ?? item['enrolled_count'] ?? 0;
  }

  getMaxStudents(item: LiveClass): number {
    return item.capacity?.max_students ?? item['max_students'] ?? 10;
  }

  viewClass(id: number): void {
    this.router.navigate(['/live-classes/details', id]);
  }

  editClass(id: number): void {
    this.router.navigate(['/live-classes/edit', id]);
  }

  createClass(): void {
    this.router.navigate(['/live-classes/create']);
  }

  // ==========================================
  // STATUS CHANGE MODAL
  // ==========================================

  openStatusModal(item: LiveClass, newStatus: LiveClassStatus): void {
    this.selectedClassForStatus = item;
    this.targetStatus = newStatus;
    this.modalService.open(this.statusConfirmModalRef, { centered: true });
  }

  confirmStatusChange(): void {
    if (!this.selectedClassForStatus || !this.targetStatus) return;

    this.isActionSubmitting = true;
    this.liveClassService.updateClassStatus(this.selectedClassForStatus.id, this.targetStatus).subscribe({
      next: (res) => {
        this.toastr.success(res.message || `Class status updated to '${this.targetStatus}'.`, 'Success');
        this.isActionSubmitting = false;
        this.modalService.dismissAll();
        this.loadClasses();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.toastr.error(err.error?.message || 'Failed to update class status.', 'Error');
        this.isActionSubmitting = false;
      }
    });
  }

  // ==========================================
  // DELETE CLASS MODAL
  // ==========================================

  openDeleteModal(item: LiveClass): void {
    this.selectedClassForDelete = item;
    this.modalService.open(this.deleteConfirmModalRef, { centered: true });
  }

  confirmDelete(): void {
    if (!this.selectedClassForDelete) return;

    this.isActionSubmitting = true;
    this.liveClassService.deleteLiveClass(this.selectedClassForDelete.id).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Live class deleted successfully.', 'Deleted');
        this.isActionSubmitting = false;
        this.modalService.dismissAll();
        this.loadClasses();
      },
      error: (err) => {
        console.error('Error deleting live class:', err);
        this.toastr.error(err.error?.message || 'Cannot delete class with confirmed bookings or active session.', 'Delete Failed');
        this.isActionSubmitting = false;
      }
    });
  }
}
