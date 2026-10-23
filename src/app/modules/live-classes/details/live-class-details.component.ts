import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
  LiveClassService,
  LiveClass,
  LiveClassBooking,
  LiveClassPayment,
  LiveClassAttendanceRecord,
  WebinarSessionMetadata,
  SessionStatus
} from '../live-class.service';

@Component({
  selector: 'app-live-class-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbPaginationModule, DatePipe],
  templateUrl: './live-class-details.component.html',
  styleUrl: './live-class-details.component.scss'
})
export class LiveClassDetailsComponent implements OnInit {
  @ViewChild('provisionModal') provisionModalRef!: TemplateRef<any>;
  @ViewChild('startSessionModal') startSessionModalRef!: TemplateRef<any>;
  @ViewChild('endSessionModal') endSessionModalRef!: TemplateRef<any>;
  @ViewChild('attendanceModal') attendanceModalRef!: TemplateRef<any>;

  classId!: number;
  liveClass?: LiveClass;
  isLoading: boolean = true;
  activeTab: 'overview' | 'session' | 'bookings' | 'attendance' | 'payments' = 'overview';

  // Webinar.gg Session state
  sessionMetadata?: WebinarSessionMetadata;
  isLoadingSession: boolean = false;
  isSessionActionSubmitting: boolean = false;

  // Student Bookings state
  bookings: LiveClassBooking[] = [];
  isLoadingBookings: boolean = false;
  bookingSearch: string = '';
  bookingStatusFilter: string = 'all';
  bookingPage: number = 1;
  bookingPageSize: number = 10;
  totalBookingsCount: number = 0;

  // Attendance state
  attendanceList: LiveClassAttendanceRecord[] = [];
  isLoadingAttendance: boolean = false;
  selectedStudentAttendance: LiveClassAttendanceRecord | null = null;

  // Payments state
  payments: LiveClassPayment[] = [];
  isLoadingPayments: boolean = false;
  paymentPage: number = 1;
  paymentPageSize: number = 10;
  totalPaymentsCount: number = 0;

  constructor(
    private liveClassService: LiveClassService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.classId = Number(params['id']);
      if (this.classId) {
        this.loadClassDetails();
      }
    });

    this.route.queryParams.subscribe(qParams => {
      if (qParams['tab'] && ['overview', 'session', 'bookings', 'attendance', 'payments'].includes(qParams['tab'])) {
        this.setActiveTab(qParams['tab'] as any);
      }
    });
  }

  loadClassDetails(): void {
    this.isLoading = true;
    this.liveClassService.getLiveClassById(this.classId).subscribe({
      next: (res) => {
        this.liveClass = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
        // Load initial tab data
        if (this.activeTab === 'session') this.loadSessionDetails();
        if (this.activeTab === 'bookings') this.loadBookings();
        if (this.activeTab === 'attendance') this.loadAttendance();
        if (this.activeTab === 'payments') this.loadPayments();
      },
      error: (err) => {
        console.error('Error loading class details:', err);
        this.toastr.error('Failed to load class details.', 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setActiveTab(tab: 'overview' | 'session' | 'bookings' | 'attendance' | 'payments'): void {
    this.activeTab = tab;
    if (tab === 'session' && !this.sessionMetadata) {
      this.loadSessionDetails();
    } else if (tab === 'bookings' && this.bookings.length === 0) {
      this.loadBookings();
    } else if (tab === 'attendance' && this.attendanceList.length === 0) {
      this.loadAttendance();
    } else if (tab === 'payments' && this.payments.length === 0) {
      this.loadPayments();
    }
  }

  // ==========================================
  // WEBINAR.GG SESSION MANAGEMENT
  // ==========================================

  loadSessionDetails(): void {
    this.isLoadingSession = true;
    this.liveClassService.getSessionDetails(this.classId).subscribe({
      next: (res) => {
        this.sessionMetadata = res.data;
        this.isLoadingSession = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching session details:', err);
        this.isLoadingSession = false;
        this.cdr.detectChanges();
      }
    });
  }

  openProvisionModal(): void {
    this.modalService.open(this.provisionModalRef, { centered: true });
  }

  confirmProvision(): void {
    this.isSessionActionSubmitting = true;
    this.liveClassService.provisionSession(this.classId).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Webinar.gg session provisioned successfully.', 'Provisioned');
        this.isSessionActionSubmitting = false;
        this.modalService.dismissAll();
        this.loadSessionDetails();
        this.loadClassDetails();
      },
      error: (err) => {
        console.error('Error provisioning session:', err);
        this.toastr.error(err.error?.message || 'Failed to provision Webinar room.', 'Error');
        this.isSessionActionSubmitting = false;
      }
    });
  }

  openStartSessionModal(): void {
    this.modalService.open(this.startSessionModalRef, { centered: true });
  }

  confirmStartSession(): void {
    this.isSessionActionSubmitting = true;
    this.liveClassService.startSession(this.classId).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Live session started! Status set to live.', 'Session Live');
        this.isSessionActionSubmitting = false;
        this.modalService.dismissAll();
        this.loadSessionDetails();
        this.loadClassDetails();
      },
      error: (err) => {
        console.error('Error starting session:', err);
        this.toastr.error(err.error?.message || 'Failed to start session.', 'Error');
        this.isSessionActionSubmitting = false;
      }
    });
  }

  openEndSessionModal(): void {
    this.modalService.open(this.endSessionModalRef, { centered: true });
  }

  confirmEndSession(): void {
    this.isSessionActionSubmitting = true;
    this.liveClassService.endSession(this.classId).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Session ended. Open student attendance intervals closed.', 'Session Ended');
        this.isSessionActionSubmitting = false;
        this.modalService.dismissAll();
        this.loadSessionDetails();
        this.loadClassDetails();
      },
      error: (err) => {
        console.error('Error ending session:', err);
        this.toastr.error(err.error?.message || 'Failed to end session.', 'Error');
        this.isSessionActionSubmitting = false;
      }
    });
  }

  copyRoomUrl(url: string | null | undefined): void {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.info('Room URL copied to clipboard.', 'Copied');
    });
  }

  // ==========================================
  // STUDENT BOOKINGS
  // ==========================================

  loadBookings(): void {
    this.isLoadingBookings = true;
    this.liveClassService.getClassBookings(this.classId, {
      status: this.bookingStatusFilter !== 'all' ? this.bookingStatusFilter : undefined,
      search: this.bookingSearch,
      page: this.bookingPage,
      limit: this.bookingPageSize
    }).subscribe({
      next: (res) => {
        this.bookings = res.data || [];
        this.totalBookingsCount = res.pagination?.total || this.bookings.length;
        this.isLoadingBookings = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.toastr.error('Failed to load bookings roster.', 'Error');
        this.isLoadingBookings = false;
        this.cdr.detectChanges();
      }
    });
  }

  onBookingFilterChange(): void {
    this.bookingPage = 1;
    this.loadBookings();
  }

  onBookingPageChange(page: number): void {
    this.bookingPage = page;
    this.loadBookings();
  }

  // ==========================================
  // ATTENDANCE MANAGEMENT
  // ==========================================

  loadAttendance(): void {
    this.isLoadingAttendance = true;
    this.liveClassService.getClassAttendance(this.classId).subscribe({
      next: (res) => {
        this.attendanceList = res.data || [];
        this.isLoadingAttendance = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading attendance list:', err);
        this.toastr.error('Failed to load class attendance records.', 'Error');
        this.isLoadingAttendance = false;
        this.cdr.detectChanges();
      }
    });
  }

  studentIntervals: any[] = [];
  isLoadingIntervals: boolean = false;

  openStudentAttendanceDetails(record: LiveClassAttendanceRecord): void {
    this.selectedStudentAttendance = record;
    this.studentIntervals = [];
    this.isLoadingIntervals = true;
    this.modalService.open(this.attendanceModalRef, { centered: true, size: 'lg' });

    this.liveClassService.getStudentAttendanceIntervals(this.classId, record.student_id).subscribe({
      next: (res) => {
        this.studentIntervals = res.data?.intervals || [];
        this.isLoadingIntervals = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading student intervals:', err);
        this.isLoadingIntervals = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // PAYMENTS ROSTER
  // ==========================================

  loadPayments(): void {
    this.isLoadingPayments = true;
    this.liveClassService.getClassPayments(this.classId, {
      page: this.paymentPage,
      limit: this.paymentPageSize
    }).subscribe({
      next: (res) => {
        this.payments = res.data || [];
        this.totalPaymentsCount = res.pagination?.total || this.payments.length;
        this.isLoadingPayments = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching payments:', err);
        this.toastr.error('Failed to load payments roster.', 'Error');
        this.isLoadingPayments = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPaymentPageChange(page: number): void {
    this.paymentPage = page;
    this.loadPayments();
  }

  // Helper getters
  getThumbnail(path: string | null | undefined): string {
    if (!path) return 'assets/images/media/media-48.jpg';
    return this.liveClassService.getAssetUrl(path);
  }

  getMentorPhoto(photo: string | null | undefined): string {
    if (!photo) return 'assets/images/faces/9.jpg';
    return this.liveClassService.getAssetUrl(photo);
  }

  get capacityPercentage(): number {
    if (!this.liveClass?.capacity?.max_students) return 0;
    const enrolled = this.liveClass.capacity.enrolled_count || 0;
    const max = this.liveClass.capacity.max_students || 1;
    return Math.min(100, Math.round((enrolled / max) * 100));
  }
}
