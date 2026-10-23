import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';

export interface BookingStudent {
  id: number;
  full_name: string;
  mobile: string;
  email: string;
  profile_image?: string | null;
  gender?: string | null;
}

export interface BookingMentor {
  id: number;
  full_name: string;
  qualification?: string;
  expert_in?: string;
  photo?: string;
  mobile_number?: string;
  email?: string;
  experience?: string;
}

export interface WebinarSessionDetails {
  id?: number;
  booking_id?: number;
  webinar_id: string;
  webinar_title?: string | null;
  webinar_status?: 'scheduled' | 'live' | 'ended' | 'cancelled' | 'deleted' | string;
  scheduled_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_minutes?: number | null;
  timezone?: string | null;
  recording_url?: string | null;
  room_url?: string | null;
  passcode?: string | null;
  host_email?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WebhookEvent {
  id: number;
  event_id?: string | null;
  event_type: string;
  webinar_id?: string | null;
  payload?: any;
  processed_status: 'pending' | 'processed' | 'ignored' | 'failed' | string;
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ZoomMeetingDetails {
  meeting_provider?: 'zoom' | 'google_meet' | 'webinar_gg' | string | null;
  meeting_status?: 'scheduled' | 'pending' | 'failed' | 'completed' | 'cancelled' | string | null;
  zoom_meeting_id?: string | null;
  zoom_meeting_password?: string | null;
  zoom_join_url?: string | null;
  zoom_start_url?: string | null;
  zoom_host_email?: string | null;
  zoom_created_at?: string | null;
  duration_minutes?: number | null;
  [key: string]: any;
}

export interface MentorBooking {
  id: number;
  booking_number: string;
  slot_id?: number | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  booking_date: string;
  start_time: string;
  end_time: string;
  topic?: string;
  student_notes?: string;
  google_meet_url?: string | null;
  meeting_notes?: string | null;
  rejection_reason?: string | null;
  amount?: string | number;
  payment_status?: 'free' | 'pending' | 'paid' | 'failed' | 'refunded' | string;
  payment_method?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  transaction_id?: string | null;
  paid_at?: string | null;
  
  // Webinar.gg Integration fields
  webinar_id?: string | null;
  webinar_status?: 'scheduled' | 'live' | 'ended' | 'cancelled' | 'deleted' | string | null;
  room_url?: string | null;
  recording_url?: string | null;
  webinar?: WebinarSessionDetails | null;

  // Meeting & Zoom fields
  meeting_provider?: 'zoom' | 'google_meet' | 'webinar_gg' | string | null;
  meeting_status?: 'scheduled' | 'pending' | 'failed' | 'completed' | 'cancelled' | string | null;
  zoom_meeting_id?: string | null;
  zoom_meeting_password?: string | null;
  zoom_join_url?: string | null;
  zoom_start_url?: string | null;
  zoom_host_email?: string | null;
  zoom_created_at?: string | null;
  duration_minutes?: number | null;
  zoom?: ZoomMeetingDetails | null;

  created_at?: string;
  updated_at?: string;
  student?: BookingStudent;
  mentor?: BookingMentor;
}

export interface BookingCounts {
  all: number;
  pending: number;
  confirmed: number;
  completed: number;
  rejected: number;
  cancelled: number;
  upcoming?: number;
  live?: number;
  recordings?: number;
  failed_webhooks?: number;
}

export interface SlotSummary {
  total_slots: number;
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  rejected_bookings: number;
  upcoming_sessions?: number;
  live_sessions?: number;
  recordings_available?: number;
}

export interface MentorSlotWithBookings {
  slot_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  status: string;
  total_bookings_count: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
  cancelled_count: number;
  rejected_count: number;
  bookings: MentorBooking[];
  is_collapsed?: boolean;
}

export interface SlotWiseData {
  mentor: BookingMentor | null;
  summary: SlotSummary;
  slots: MentorSlotWithBookings[];
  unassigned_bookings: MentorBooking[];
}

@Component({
  selector: 'app-mentor-bookings',
  standalone: true,
  imports: [SpkReusableTables, FormsModule, DatePipe, CommonModule],
  templateUrl: './mentor-bookings.html',
  styleUrl: './mentor-bookings.scss'
})
export class MentorBookings implements OnInit {
  // View mode switcher: 'table' (All Bookings Table) | 'slot_wise' (Slot-Wise Student Bookings Explorer) | 'webhooks' (Webhook Monitoring)
  activeViewMode: 'table' | 'slot_wise' | 'webhooks' = 'slot_wise';

  // --- Common Lists ---
  mentorsList: any[] = [];
  selectedBooking: MentorBooking | null = null;
  isLoadingDetails: boolean = false;
  isLoadingZoom: boolean = false;
  isLoadingWebinar: boolean = false;
  isSyncingZoom: { [key: number]: boolean } = {};
  isSyncingWebinar: { [key: number]: boolean } = {};

  // --- View Mode 1: Slot-Wise Explorer State ---
  selectedSlotMentorId: string = '';
  slotWiseData: SlotWiseData | null = null;
  isLoadingSlotWise: boolean = false;
  slotFilterDate: string = '';
  slotFilterStatus: string = 'all';
  slotSearchTerm: string = '';

  // --- View Mode 2: All Bookings Flat Table State ---
  bookings: MentorBooking[] = [];
  total: number = 0;
  page: number = 1;
  limit: number = 10;
  totalPages: number = 1;
  isLoading: boolean = false;

  selectedStatus: string = 'all'; // all, pending, confirmed, completed, rejected, cancelled, upcoming, live, recordings
  searchTerm: string = '';
  filterDate: string = '';
  filterMentorId: string = '';

  // KPI Metrics (Global)
  kpiCounts: BookingCounts = {
    all: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
    upcoming: 0,
    live: 0,
    recordings: 0,
    failed_webhooks: 0
  };

  // --- Webhook Events Monitoring State ---
  webhookEvents: WebhookEvent[] = [];
  webhookTotal: number = 0;
  webhookPage: number = 1;
  webhookLimit: number = 10;
  webhookTotalPages: number = 1;
  webhookFilterStatus: string = 'failed'; // 'failed', 'all', 'processed'
  isLoadingWebhooks: boolean = false;
  isRetryingWebhook: { [key: number]: boolean } = {};

  // --- Modals Form States ---
  acceptMeetUrl: string = '';
  acceptMeetNotes: string = 'Please join the session on time. Keep your camera and audio enabled.';
  isSubmittingAccept: boolean = false;

  rejectionReason: string = '';
  isSubmittingReject: boolean = false;

  editMeetUrl: string = '';
  editMeetNotes: string = '';
  isSubmittingEditMeet: boolean = false;

  private mentorBookingsAdminUrl = `${environment.apiUrl}/mentor-bookings/admin`;
  private fallbackAdminUrl = `${environment.apiUrl}/admin/mentor-bookings`;
  private mentorsUrl = `${environment.apiUrl}/mentor`;

  constructor(
    private modalService: NgbModal,
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastr.warning('Please log in first.', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadMentors();

    // Check query params for mentor_id or view preference
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'table') {
        this.activeViewMode = 'table';
      } else if (params['view'] === 'slots' || params['view'] === 'slot_wise') {
        this.activeViewMode = 'slot_wise';
      } else if (params['view'] === 'webhooks') {
        this.activeViewMode = 'webhooks';
      }

      if (params['status']) {
        this.selectedStatus = params['status'];
      }

      if (params['mentor_id']) {
        this.selectedSlotMentorId = params['mentor_id'].toString();
        this.filterMentorId = params['mentor_id'].toString();
        this.loadSlotWiseBookings();
      }
    });

    this.loadBookings();
    this.loadKpiCounts();
    this.loadWebhookEvents();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  switchViewMode(mode: 'table' | 'slot_wise' | 'webhooks'): void {
    this.activeViewMode = mode;
    if (mode === 'slot_wise') {
      if (!this.selectedSlotMentorId && this.mentorsList.length > 0) {
        this.selectedSlotMentorId = this.mentorsList[0].id.toString();
      }
      if (this.selectedSlotMentorId && !this.slotWiseData) {
        this.loadSlotWiseBookings();
      }
    } else if (mode === 'webhooks') {
      this.loadWebhookEvents();
    } else {
      this.loadBookings();
      this.loadKpiCounts();
    }
  }

  loadMentors(): void {
    this.http.get<any>(this.mentorsUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.mentorsList = res.data;
          // Auto-select first mentor for slot-wise view if none selected
          if (!this.selectedSlotMentorId && this.mentorsList.length > 0) {
            this.selectedSlotMentorId = this.mentorsList[0].id.toString();
            if (this.activeViewMode === 'slot_wise') {
              this.loadSlotWiseBookings();
            }
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading mentors list:', err)
    });
  }

  // =========================================================================
  // 1. SLOT-WISE BOOKINGS EXPLORER METHODS
  // =========================================================================
  onSlotMentorChange(): void {
    this.loadSlotWiseBookings();
  }

  onSlotFilterChange(): void {
    this.loadSlotWiseBookings();
  }

  resetSlotFilters(): void {
    this.slotFilterDate = '';
    this.slotFilterStatus = 'all';
    this.slotSearchTerm = '';
    this.loadSlotWiseBookings();
  }

  loadSlotWiseBookings(): void {
    if (!this.selectedSlotMentorId) {
      this.slotWiseData = null;
      return;
    }

    this.isLoadingSlotWise = true;
    let params = new HttpParams();

    if (this.slotFilterDate) {
      params = params.set('date', this.slotFilterDate);
    }
    if (this.slotFilterStatus && this.slotFilterStatus !== 'all') {
      params = params.set('status', this.slotFilterStatus);
    }
    if (this.slotSearchTerm.trim()) {
      params = params.set('search', this.slotSearchTerm.trim());
    }

    const primaryUrl = `${this.mentorBookingsAdminUrl}/mentor/${this.selectedSlotMentorId}/slots`;
    const fallbackUrl1 = `${this.mentorBookingsAdminUrl}/slots-bookings?mentor_id=${this.selectedSlotMentorId}`;
    const fallbackUrl2 = `${environment.apiUrl}/mentor/${this.selectedSlotMentorId}/slots-bookings`;

    this.http.get<any>(primaryUrl, { headers: this.getHeaders(), params }).subscribe({
      next: (res) => {
        this.isLoadingSlotWise = false;
        if (res.status || res.success) {
          this.handleSlotWiseResponse(res.data || res);
        } else {
          this.tryFallbackSlotWise(fallbackUrl1, params, fallbackUrl2);
        }
      },
      error: (err) => {
        console.warn('Primary slot-wise endpoint failed, trying fallback 1...', err);
        this.tryFallbackSlotWise(fallbackUrl1, params, fallbackUrl2);
      }
    });
  }

  private tryFallbackSlotWise(fallbackUrl: string, params: HttpParams, nextFallbackUrl?: string): void {
    this.http.get<any>(fallbackUrl, { headers: this.getHeaders(), params }).subscribe({
      next: (res) => {
        this.isLoadingSlotWise = false;
        if (res.status || res.success) {
          this.handleSlotWiseResponse(res.data || res);
        } else if (nextFallbackUrl) {
          this.tryNextFallbackSlotWise(nextFallbackUrl, params);
        } else {
          this.slotWiseData = null;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        if (nextFallbackUrl) {
          this.tryNextFallbackSlotWise(nextFallbackUrl, params);
        } else {
          this.isLoadingSlotWise = false;
          console.error('All slot-wise endpoints failed:', err);
          this.toastr.error('Failed to load mentor slot bookings.', 'Error');
          this.slotWiseData = null;
          this.cdr.detectChanges();
        }
      }
    });
  }

  private tryNextFallbackSlotWise(url: string, params: HttpParams): void {
    this.http.get<any>(url, { headers: this.getHeaders(), params }).subscribe({
      next: (res) => {
        this.isLoadingSlotWise = false;
        if (res.status || res.success) {
          this.handleSlotWiseResponse(res.data || res);
        } else {
          this.slotWiseData = null;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoadingSlotWise = false;
        console.error('Slot-wise direct mentor route failed:', err);
        this.toastr.error('Failed to load mentor slot bookings.', 'Error');
        this.slotWiseData = null;
        this.cdr.detectChanges();
      }
    });
  }

  private handleSlotWiseResponse(data: any): void {
    if (!data) {
      this.slotWiseData = null;
      this.cdr.detectChanges();
      return;
    }

    const slots: MentorSlotWithBookings[] = (data.slots || []).map((s: any) => ({
      ...s,
      is_collapsed: false,
      bookings: Array.isArray(s.bookings) ? s.bookings : []
    }));

    this.slotWiseData = {
      mentor: data.mentor || null,
      summary: data.summary || {
        total_slots: slots.length,
        total_bookings: 0,
        pending_bookings: 0,
        confirmed_bookings: 0,
        completed_bookings: 0,
        cancelled_bookings: 0,
        rejected_bookings: 0
      },
      slots: slots,
      unassigned_bookings: Array.isArray(data.unassigned_bookings) ? data.unassigned_bookings : []
    };

    this.cdr.detectChanges();
  }

  toggleSlotCollapse(slot: MentorSlotWithBookings): void {
    slot.is_collapsed = !slot.is_collapsed;
  }

  expandAllSlots(): void {
    if (this.slotWiseData?.slots) {
      this.slotWiseData.slots.forEach(s => s.is_collapsed = false);
    }
  }

  collapseAllSlots(): void {
    if (this.slotWiseData?.slots) {
      this.slotWiseData.slots.forEach(s => s.is_collapsed = true);
    }
  }

  // =========================================================================
  // 2. ALL BOOKINGS LIST (FLAT TABLE VIEW) METHODS
  // =========================================================================
  loadKpiCounts(): void {
    const params = new HttpParams().set('limit', '1000');
    const url = `${this.mentorBookingsAdminUrl}/all`;

    this.http.get<any>(url, { headers: this.getHeaders(), params }).subscribe({
      next: (res) => {
        const data = res.data || res;
        const list: MentorBooking[] = data.bookings || (Array.isArray(data) ? data : []);
        this.updateKpiCountsFromList(list, data.summary);
      },
      error: () => {
        // Fallback to older route
        this.http.get<any>(this.fallbackAdminUrl, { headers: this.getHeaders(), params }).subscribe({
          next: (res) => {
            const data = res.data || res;
            const list: MentorBooking[] = data.bookings || (Array.isArray(data) ? data : []);
            this.updateKpiCountsFromList(list, data.summary);
          },
          error: (err) => console.error('Error loading KPI counts:', err)
        });
      }
    });
  }

  private updateKpiCountsFromList(list: MentorBooking[], backendSummary?: any): void {
    const todayStr = new Date().toISOString().slice(0, 10);

    this.kpiCounts.all = list.length;
    this.kpiCounts.pending = list.filter(b => b.status === 'pending').length;
    this.kpiCounts.confirmed = list.filter(b => b.status === 'confirmed').length;
    this.kpiCounts.completed = list.filter(b => b.status === 'completed').length;
    this.kpiCounts.rejected = list.filter(b => b.status === 'rejected').length;
    this.kpiCounts.cancelled = list.filter(b => b.status === 'cancelled').length;

    // Derived Webinar KPIs
    this.kpiCounts.live = list.filter(b => (b.webinar_status === 'live' || b.webinar?.webinar_status === 'live')).length;
    this.kpiCounts.upcoming = list.filter(b => {
      if (b.status !== 'confirmed') return false;
      const bDate = b.booking_date ? b.booking_date.slice(0, 10) : '';
      return bDate >= todayStr;
    }).length;
    this.kpiCounts.recordings = list.filter(b => !!b.recording_url || !!b.webinar?.recording_url).length;

    // If backend returned extra summary counts, prioritize them
    if (backendSummary) {
      if (backendSummary.upcoming_sessions !== undefined) this.kpiCounts.upcoming = backendSummary.upcoming_sessions;
      if (backendSummary.live_sessions !== undefined) this.kpiCounts.live = backendSummary.live_sessions;
      if (backendSummary.recordings_available !== undefined) this.kpiCounts.recordings = backendSummary.recordings_available;
    }

    this.cdr.detectChanges();
  }

  loadBookings(): void {
    this.isLoading = true;
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('limit', this.limit.toString());

    if (this.selectedStatus && this.selectedStatus !== 'all') {
      params = params.set('status', this.selectedStatus);
    }
    if (this.searchTerm.trim()) {
      params = params.set('search', this.searchTerm.trim());
    }
    if (this.filterDate) {
      params = params.set('date', this.filterDate);
    }
    if (this.filterMentorId) {
      params = params.set('mentor_id', this.filterMentorId);
    }

    const primaryUrl = `${this.mentorBookingsAdminUrl}/all`;

    this.http.get<any>(primaryUrl, { headers: this.getHeaders(), params }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status || res.success) {
          const data = res.data || res;
          this.bookings = data.bookings || (Array.isArray(data) ? data : []);
          this.total = data.total || this.bookings.length;
          this.totalPages = data.total_pages || Math.ceil(this.total / this.limit) || 1;
        } else {
          this.bookings = [];
          this.total = 0;
          this.totalPages = 1;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Fallback to legacy endpoint
        this.http.get<any>(this.fallbackAdminUrl, { headers: this.getHeaders(), params }).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.status || res.success) {
              const data = res.data || res;
              this.bookings = data.bookings || (Array.isArray(data) ? data : []);
              this.total = data.total || this.bookings.length;
              this.totalPages = data.total_pages || Math.ceil(this.total / this.limit) || 1;
            } else {
              this.bookings = [];
              this.total = 0;
              this.totalPages = 1;
            }
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.isLoading = false;
            console.error('Error fetching bookings list:', e);
            this.toastr.error(e.error?.message || 'Failed to load bookings list.', 'Error');
            this.bookings = [];
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  onStatusTabChange(status: string): void {
    this.selectedStatus = status;
    this.page = 1;
    if (status === 'webhooks') {
      this.activeViewMode = 'webhooks';
      this.loadWebhookEvents();
    } else {
      if (this.activeViewMode === 'webhooks') {
        this.activeViewMode = 'table';
      }
      this.loadBookings();
    }
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadBookings();
  }

  onDateFilterChange(): void {
    this.page = 1;
    this.loadBookings();
  }

  onMentorFilterChange(): void {
    this.page = 1;
    this.loadBookings();
  }

  resetFilters(): void {
    this.selectedStatus = 'all';
    this.searchTerm = '';
    this.filterDate = '';
    this.filterMentorId = '';
    this.page = 1;
    this.loadBookings();
    this.loadKpiCounts();
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages && p !== this.page) {
      this.page = p;
      this.loadBookings();
    }
  }

  // =========================================================================
  // 3. WEBINAR.GG INTEGRATION METHODS (PHASE 4 ADMIN PANEL)
  // =========================================================================

  private mergeWebinarData(booking: MentorBooking | null | undefined, webinarData: any): void {
    if (!booking || !webinarData) return;
    if (webinarData.webinar) {
      webinarData = webinarData.webinar;
    }
    booking.webinar = webinarData;
    if (webinarData.webinar_id) booking.webinar_id = webinarData.webinar_id;
    if (webinarData.webinar_status) booking.webinar_status = webinarData.webinar_status;
    if (webinarData.room_url) booking.room_url = webinarData.room_url;
    if (webinarData.recording_url) booking.recording_url = webinarData.recording_url;
    if (webinarData.duration_minutes) booking.duration_minutes = webinarData.duration_minutes;
    booking.meeting_provider = 'webinar_gg';
  }

  fetchWebinarDetails(bookingId: number): void {
    this.isLoadingWebinar = true;
    const webinarUrl = `${environment.apiUrl}/sessions/${bookingId}`;
    const fallbackUrl = `${environment.apiUrl}/mentor-bookings/${bookingId}/webinar`;

    this.http.get<any>(webinarUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoadingWebinar = false;
        if (res.status || res.success) {
          const wData = res.data || res;
          if (this.selectedBooking && this.selectedBooking.id === bookingId) {
            this.mergeWebinarData(this.selectedBooking, wData);
            this.cdr.detectChanges();
          }
        }
      },
      error: () => {
        this.http.get<any>(fallbackUrl, { headers: this.getHeaders() }).subscribe({
          next: (r) => {
            this.isLoadingWebinar = false;
            if (r.status || r.success) {
              const wData = r.data || r;
              if (this.selectedBooking && this.selectedBooking.id === bookingId) {
                this.mergeWebinarData(this.selectedBooking, wData);
                this.cdr.detectChanges();
              }
            }
          },
          error: (e) => {
            this.isLoadingWebinar = false;
            console.warn('Webinar details not yet provisioned or unavailable:', e?.message);
          }
        });
      }
    });
  }

  syncWebinar(bookingOrId: MentorBooking | number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const bookingId = typeof bookingOrId === 'number' ? bookingOrId : bookingOrId.id;
    if (!bookingId) return;

    if (this.isSyncingWebinar[bookingId]) {
      return; // prevent duplicate clicks
    }

    this.isSyncingWebinar[bookingId] = true;
    this.cdr.detectChanges();

    const primaryUrl = `${environment.apiUrl}/sessions/${bookingId}/webinar`;
    const fallbackUrl = `${environment.apiUrl}/mentor-bookings/${bookingId}/webinar`;

    this.http.post<any>(primaryUrl, {}, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isSyncingWebinar[bookingId] = false;
        if (res.status || res.success) {
          this.toastr.success(res.message || 'Webinar.gg live session synchronized successfully!', 'Webinar Ready');
          const wData = res.data || res;
          if (this.selectedBooking && this.selectedBooking.id === bookingId) {
            this.mergeWebinarData(this.selectedBooking, wData);
          }
          this.fetchFreshBookingDetails(bookingId);
          this.refreshCurrentView();
        } else {
          this.toastr.error(res.message || 'Unable to synchronize Webinar.gg session.', 'Sync Failed');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.http.post<any>(fallbackUrl, {}, { headers: this.getHeaders() }).subscribe({
          next: (r) => {
            this.isSyncingWebinar[bookingId] = false;
            if (r.status || r.success) {
              this.toastr.success(r.message || 'Webinar.gg live session synchronized successfully!', 'Webinar Ready');
              const wData = r.data || r;
              if (this.selectedBooking && this.selectedBooking.id === bookingId) {
                this.mergeWebinarData(this.selectedBooking, wData);
              }
              this.fetchFreshBookingDetails(bookingId);
              this.refreshCurrentView();
            } else {
              this.toastr.error(r.message || 'Unable to synchronize Webinar.gg session.', 'Sync Failed');
            }
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.isSyncingWebinar[bookingId] = false;
            console.error('Error synchronizing Webinar.gg session:', e);
            const msg = e.error?.message || err.error?.message || 'Failed to synchronize Webinar.gg session. Please check backend connection.';
            this.toastr.error(msg, 'Webinar Sync Failed');
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  isWebinarBooking(booking?: MentorBooking | null): boolean {
    if (!booking) return false;
    return booking.meeting_provider === 'webinar_gg' ||
           !!booking.webinar_id ||
           !!booking.webinar?.webinar_id ||
           !!booking.room_url;
  }

  getWebinarId(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.webinar_id || booking.webinar?.webinar_id || '';
  }

  getWebinarStatus(booking?: MentorBooking | null): string {
    if (!booking) return 'none';
    const st = (booking.webinar_status || booking.webinar?.webinar_status || '').toLowerCase();
    if (st) return st;
    if (booking.webinar_id || booking.webinar?.webinar_id) return 'scheduled';
    if (booking.status === 'confirmed') return 'pending_provision';
    return 'none';
  }

  getWebinarBadgeClass(status?: string | null): string {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'webinar-badge-live';
      case 'scheduled':
        return 'webinar-badge-scheduled';
      case 'ended':
        return 'webinar-badge-ended';
      case 'cancelled':
      case 'deleted':
        return 'webinar-badge-cancelled';
      case 'pending_provision':
        return 'webinar-badge-pending';
      default:
        return 'webinar-badge-none';
    }
  }

  getRoomUrl(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.room_url || booking.webinar?.room_url || booking.google_meet_url || '';
  }

  getRecordingUrl(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.recording_url || booking.webinar?.recording_url || '';
  }

  hasRecording(booking?: MentorBooking | null): boolean {
    return !!this.getRecordingUrl(booking);
  }

  copySessionRoomLink(url?: string | null): void {
    this.copyToClipboard(url, 'Shareable Webinar Room Link');
  }

  copyWebinarId(id?: string | null): void {
    this.copyToClipboard(id, 'Webinar.gg ID');
  }

  copyRecordingUrl(url?: string | null): void {
    this.copyToClipboard(url, 'Session Recording URL');
  }

  openRecording(url?: string | null): void {
    if (!url) {
      this.toastr.warning('No recording URL available yet. Processing usually finishes shortly after session ends.', 'Recording Pending');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // =========================================================================
  // 4. WEBHOOK EVENTS AUDIT & RETRY MONITORING
  // =========================================================================

  loadWebhookEvents(): void {
    this.isLoadingWebhooks = true;
    let params = new HttpParams()
      .set('page', this.webhookPage.toString())
      .set('limit', this.webhookLimit.toString());

    if (this.webhookFilterStatus && this.webhookFilterStatus !== 'all') {
      params = params.set('status', this.webhookFilterStatus);
    }

    const primaryUrl = `${environment.apiUrl}/webinar/webhook/events`;
    const fallbackUrl = `${environment.apiUrl}/sessions/webhook/events`;

    this.http.get<any>(primaryUrl, { headers: this.getHeaders(), params }).subscribe({
      next: (res) => {
        this.isLoadingWebhooks = false;
        if (res.success || res.status) {
          const data = res.data || res;
          this.webhookEvents = data.events || (Array.isArray(data) ? data : []);
          this.webhookTotal = data.total || this.webhookEvents.length;
          this.webhookTotalPages = data.total_pages || Math.ceil(this.webhookTotal / this.webhookLimit) || 1;
          this.kpiCounts.failed_webhooks = this.webhookEvents.filter(e => e.processed_status === 'failed').length;
        } else {
          this.webhookEvents = [];
          this.webhookTotal = 0;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback endpoint
        this.http.get<any>(fallbackUrl, { headers: this.getHeaders(), params }).subscribe({
          next: (r) => {
            this.isLoadingWebhooks = false;
            if (r.success || r.status) {
              const data = r.data || r;
              this.webhookEvents = data.events || (Array.isArray(data) ? data : []);
              this.webhookTotal = data.total || this.webhookEvents.length;
              this.webhookTotalPages = data.total_pages || Math.ceil(this.webhookTotal / this.webhookLimit) || 1;
              this.kpiCounts.failed_webhooks = this.webhookEvents.filter(e => e.processed_status === 'failed').length;
            } else {
              this.webhookEvents = [];
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.isLoadingWebhooks = false;
            console.warn('Webhook audit events endpoint not available or returned error:', err?.message);
            this.webhookEvents = [];
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  onWebhookStatusFilterChange(): void {
    this.webhookPage = 1;
    this.loadWebhookEvents();
  }

  retryWebhookEvent(ev: WebhookEvent, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.isRetryingWebhook[ev.id]) return;

    this.isRetryingWebhook[ev.id] = true;
    this.cdr.detectChanges();

    const retryUrl = `${environment.apiUrl}/webinar/webhook/retry/${ev.id}`;
    const fallbackRetryUrl = `${environment.apiUrl}/sessions/webhook/retry/${ev.id}`;

    this.http.post<any>(retryUrl, {}, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isRetryingWebhook[ev.id] = false;
        if (res.success || res.status) {
          this.toastr.success(res.message || `Webhook event #${ev.id} reprocessed successfully!`, 'Webhook Reprocessed');
          this.loadWebhookEvents();
          this.loadBookings();
        } else {
          this.toastr.error(res.message || 'Failed to reprocess webhook event.', 'Retry Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.http.post<any>(fallbackRetryUrl, {}, { headers: this.getHeaders() }).subscribe({
          next: (r) => {
            this.isRetryingWebhook[ev.id] = false;
            this.toastr.success(r.message || `Webhook event #${ev.id} reprocessed successfully!`, 'Webhook Reprocessed');
            this.loadWebhookEvents();
            this.loadBookings();
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.isRetryingWebhook[ev.id] = false;
            console.error('Error reprocessing webhook event:', e);
            const msg = e.error?.message || err.error?.message || 'Failed to reprocess webhook event.';
            this.toastr.error(msg, 'Retry Failed');
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  getWebhookStatusBadgeClass(status?: string | null): string {
    switch (status?.toLowerCase()) {
      case 'processed':
        return 'badge bg-success-transparent text-success border border-success-subtle';
      case 'failed':
        return 'badge bg-danger-transparent text-danger border border-danger-subtle';
      case 'ignored':
        return 'badge bg-secondary-transparent text-muted border border-secondary-subtle';
      default:
        return 'badge bg-warning-transparent text-warning border border-warning-subtle';
    }
  }

  // =========================================================================
  // 5. ZOOM & PAYMENT LEGACY HELPERS & COMPATIBILITY METHODS
  // =========================================================================

  private mergeZoomData(booking: MentorBooking | null | undefined, zoomData: any): void {
    if (!booking || !zoomData) return;
    if (zoomData.zoom) {
      zoomData = zoomData.zoom;
    }
    booking.zoom = zoomData;
    if (zoomData.meeting_provider) booking.meeting_provider = zoomData.meeting_provider;
    if (zoomData.meeting_status) booking.meeting_status = zoomData.meeting_status;
    if (zoomData.zoom_meeting_id) booking.zoom_meeting_id = zoomData.zoom_meeting_id;
    if (zoomData.zoom_meeting_password) booking.zoom_meeting_password = zoomData.zoom_meeting_password;
    if (zoomData.zoom_join_url) booking.zoom_join_url = zoomData.zoom_join_url;
    if (zoomData.zoom_start_url) booking.zoom_start_url = zoomData.zoom_start_url;
    if (zoomData.zoom_host_email) booking.zoom_host_email = zoomData.zoom_host_email;
    if (zoomData.zoom_created_at) booking.zoom_created_at = zoomData.zoom_created_at;
    if (zoomData.duration_minutes) booking.duration_minutes = zoomData.duration_minutes;
  }

  fetchZoomDetails(bookingId: number): void {
    this.isLoadingZoom = true;
    const zoomUrl = `${environment.apiUrl}/mentor-bookings/${bookingId}/zoom`;
    this.http.get<any>(zoomUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoadingZoom = false;
        if (res.status || res.success) {
          const zoomData = res.data || res;
          if (this.selectedBooking && this.selectedBooking.id === bookingId) {
            this.mergeZoomData(this.selectedBooking, zoomData);
            this.cdr.detectChanges();
          }
        }
      },
      error: (err) => {
        this.isLoadingZoom = false;
        console.warn('Zoom details fetch not available or failed:', err);
      }
    });
  }

  fetchFreshBookingDetails(bookingId: number): void {
    this.http.get<any>(`${this.fallbackAdminUrl}/${bookingId}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.status || res.success) {
          const freshData = res.data || res;
          if (this.selectedBooking && this.selectedBooking.id === bookingId) {
            this.selectedBooking = { ...this.selectedBooking, ...freshData };
            if (freshData.webinar) {
              this.mergeWebinarData(this.selectedBooking, freshData.webinar);
            }
            if (freshData.zoom) {
              this.mergeZoomData(this.selectedBooking, freshData.zoom);
            }
            this.cdr.detectChanges();
          }
        }
      },
      error: (err) => console.error('Error reloading single booking details:', err)
    });
  }

  syncZoom(bookingOrId: MentorBooking | number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const bookingId = typeof bookingOrId === 'number' ? bookingOrId : bookingOrId.id;
    if (!bookingId) return;

    if (this.isSyncingZoom[bookingId]) {
      return;
    }

    this.isSyncingZoom[bookingId] = true;
    this.cdr.detectChanges();

    const primaryUrl = `${environment.apiUrl}/admin/mentor-bookings/${bookingId}/sync-zoom`;
    const fallbackUrl = `${this.mentorBookingsAdminUrl}/${bookingId}/sync-zoom`;

    this.http.post<any>(primaryUrl, {}, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isSyncingZoom[bookingId] = false;
        if (res.status || res.success) {
          this.toastr.success(res.message || 'Zoom meeting synchronized successfully.', 'Zoom Synchronized');
          const zoomData = res.data?.zoom || res.data || res;
          if (this.selectedBooking && this.selectedBooking.id === bookingId) {
            this.mergeZoomData(this.selectedBooking, zoomData);
          }
          this.fetchFreshBookingDetails(bookingId);
          this.refreshCurrentView();
        } else {
          this.toastr.error(res.message || 'Unable to synchronize the Zoom meeting.', 'Sync Failed');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.http.post<any>(fallbackUrl, {}, { headers: this.getHeaders() }).subscribe({
          next: (res) => {
            this.isSyncingZoom[bookingId] = false;
            if (res.status || res.success) {
              this.toastr.success(res.message || 'Zoom meeting synchronized successfully.', 'Zoom Synchronized');
              const zoomData = res.data?.zoom || res.data || res;
              if (this.selectedBooking && this.selectedBooking.id === bookingId) {
                this.mergeZoomData(this.selectedBooking, zoomData);
              }
              this.fetchFreshBookingDetails(bookingId);
              this.refreshCurrentView();
            } else {
              this.toastr.error(res.message || 'Unable to synchronize the Zoom meeting.', 'Sync Failed');
            }
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.isSyncingZoom[bookingId] = false;
            console.error('Error synchronizing Zoom meeting:', e);
            this.toastr.error('Unable to synchronize the Zoom meeting.', 'Zoom Sync Failed');
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  isZoomBooking(booking?: MentorBooking | null): boolean {
    if (!booking) return false;
    return booking.meeting_provider === 'zoom' ||
           !!booking.zoom_meeting_id ||
           !!booking.zoom?.zoom_meeting_id ||
           !!booking.zoom_join_url ||
           !!booking.zoom?.zoom_join_url;
  }

  isGoogleMeetBooking(booking?: MentorBooking | null): boolean {
    if (!booking) return false;
    return booking.meeting_provider === 'google_meet' ||
           (!!booking.google_meet_url && !this.isZoomBooking(booking) && !this.isWebinarBooking(booking));
  }

  getZoomMeetingId(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.zoom_meeting_id || booking.zoom?.zoom_meeting_id || '';
  }

  getZoomPasscode(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.zoom_meeting_password || booking.zoom?.zoom_meeting_password || '';
  }

  getZoomJoinUrl(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.zoom_join_url || booking.zoom?.zoom_join_url || '';
  }

  getZoomStartUrl(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.zoom_start_url || booking.zoom?.zoom_start_url || '';
  }

  getZoomHostEmail(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.zoom_host_email || booking.zoom?.zoom_host_email || '';
  }

  getZoomCreatedAt(booking?: MentorBooking | null): string {
    if (!booking) return '';
    return booking.zoom_created_at || booking.zoom?.zoom_created_at || '';
  }

  getZoomDuration(booking?: MentorBooking | null): number | null {
    if (!booking) return null;
    return booking.duration_minutes || booking.zoom?.duration_minutes || null;
  }

  getZoomStatus(booking?: MentorBooking | null): string {
    if (!booking) return 'not_created';
    const status = (booking.meeting_status || booking.zoom?.meeting_status || '').toLowerCase();
    if (status) return status;
    if (booking.zoom_meeting_id || booking.zoom?.zoom_meeting_id) return 'scheduled';
    if (booking.meeting_provider === 'zoom') return 'pending';
    return 'not_created';
  }

  getBookingPaymentStatus(booking?: MentorBooking | null): string {
    if (!booking) return 'FREE';
    if (booking.payment_status) return booking.payment_status.toUpperCase();
    if (booking.amount && parseFloat(booking.amount.toString()) > 0) return 'PENDING';
    return 'FREE';
  }

  getPaymentBadgeClass(paymentStatus?: string | null): string {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid': return 'badge-payment-paid';
      case 'free': return 'badge-payment-free';
      case 'pending': return 'badge-payment-pending';
      case 'failed': return 'badge-payment-failed';
      case 'refunded': return 'badge-payment-refunded';
      default: return 'bg-light text-muted border';
    }
  }

  copyToClipboard(text: string | null | undefined, label: string): void {
    if (!text) {
      this.toastr.warning(`No ${label} available to copy.`, 'Warning');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      this.toastr.success(`${label} copied to clipboard!`, 'Copied');
    }).catch(err => {
      console.error('Copy failed:', err);
      this.toastr.error(`Failed to copy ${label}`, 'Error');
    });
  }

  copyMeetingId(id?: string | null): void {
    this.copyToClipboard(id, 'Meeting ID');
  }

  copyPasscode(passcode?: string | null): void {
    this.copyToClipboard(passcode, 'Passcode');
  }

  copyJoinUrl(url?: string | null): void {
    this.copyToClipboard(url, 'Zoom Join URL');
  }

  copyStartUrl(url?: string | null): void {
    this.copyToClipboard(url, 'Host Start URL');
  }

  copyTransactionId(id?: string | null): void {
    this.copyToClipboard(id, 'Transaction ID');
  }

  openUrl(url?: string | null): void {
    if (!url) {
      this.toastr.warning('No URL provided.', 'Warning');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // =========================================================================
  // 6. COMMON BOOKING ACTIONS & MODALS
  // =========================================================================
  getPhotoUrl(photoPath?: string | null): string {
    if (!photoPath) return 'assets/images/faces/9.jpg';
    if (photoPath.startsWith('http')) return photoPath;
    return `${environment.baseUrl}${photoPath}`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'booking-badge-pending';
      case 'confirmed': return 'booking-badge-confirmed';
      case 'completed': return 'booking-badge-completed';
      case 'rejected': return 'booking-badge-rejected';
      case 'cancelled': return 'booking-badge-cancelled';
      default: return 'bg-light text-muted';
    }
  }

  // --- View Details Modal ---
  openViewModal(booking: MentorBooking, content: any): void {
    this.selectedBooking = { ...booking };
    this.isLoadingDetails = true;
    this.isLoadingZoom = true;
    this.isLoadingWebinar = true;

    // Fetch fresh single booking details
    this.http.get<any>(`${this.fallbackAdminUrl}/${booking.id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoadingDetails = false;
        if (res.status || res.success) {
          const freshData = res.data || res;
          this.selectedBooking = { ...this.selectedBooking, ...freshData };
          if (freshData.webinar) {
            this.mergeWebinarData(this.selectedBooking, freshData.webinar);
          }
          if (freshData.zoom) {
            this.mergeZoomData(this.selectedBooking, freshData.zoom);
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoadingDetails = false;
        console.error('Error fetching single booking details:', err);
      }
    });

    // Fetch Webinar.gg session details
    this.fetchWebinarDetails(booking.id);

    // Fetch Zoom session details if applicable
    this.fetchZoomDetails(booking.id);

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  // --- Accept Booking Modal ---
  openAcceptModal(booking: MentorBooking, content: any, fromViewModal?: any): void {
    if (fromViewModal) {
      fromViewModal.dismiss();
    }
    this.selectedBooking = booking;
    this.acceptMeetUrl = '';
    this.acceptMeetNotes = 'Please join the session on time. Keep your camera and audio enabled.';
    this.isSubmittingAccept = false;

    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  submitAcceptBooking(modal: any): void {
    if (!this.selectedBooking) return;

    this.isSubmittingAccept = true;
    const url = `${this.mentorBookingsAdminUrl}/${this.selectedBooking.id}/accept`;
    const payload = {
      meeting_notes: this.acceptMeetNotes ? this.acceptMeetNotes.trim() : 'Please join the session on time. Keep your camera and audio enabled.'
    };

    this.http.post<any>(url, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isSubmittingAccept = false;
        if (res.status || res.success) {
          this.toastr.success(res.message || 'Booking confirmed and Webinar.gg live session scheduled successfully!', 'Booking Confirmed');
          modal.close();
          this.refreshCurrentView();
        } else {
          this.toastr.error(res.message || 'Failed to accept booking', 'Error');
        }
      },
      error: (err) => {
        // Fallback: try PUT on fallback route
        const fallbackUrl = `${this.fallbackAdminUrl}/${this.selectedBooking!.id}/accept`;
        this.http.put<any>(fallbackUrl, payload, { headers: this.getHeaders() }).subscribe({
          next: (r) => {
            this.isSubmittingAccept = false;
            this.toastr.success(r.message || 'Booking confirmed and Webinar.gg live session scheduled successfully!', 'Booking Confirmed');
            modal.close();
            this.refreshCurrentView();
          },
          error: (e) => {
            this.isSubmittingAccept = false;
            console.error('Error accepting booking:', e);
            this.toastr.error(e.error?.message || err.error?.message || 'Server error while accepting booking', 'Error');
          }
        });
      }
    });
  }

  // --- Reject Booking Modal ---
  openRejectModal(booking: MentorBooking, content: any, fromViewModal?: any): void {
    if (fromViewModal) {
      fromViewModal.dismiss();
    }
    this.selectedBooking = booking;
    this.rejectionReason = '';
    this.isSubmittingReject = false;

    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  submitRejectBooking(modal: any): void {
    if (!this.selectedBooking) return;
    if (!this.rejectionReason.trim()) {
      this.toastr.warning('Please enter a rejection reason.', 'Validation');
      return;
    }

    this.isSubmittingReject = true;
    const url = `${this.mentorBookingsAdminUrl}/${this.selectedBooking.id}/reject`;
    const payload = {
      rejection_reason: this.rejectionReason.trim()
    };

    this.http.post<any>(url, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isSubmittingReject = false;
        if (res.status || res.success) {
          this.toastr.success(res.message || 'Booking rejected successfully', 'Rejected');
          modal.close();
          this.refreshCurrentView();
        } else {
          this.toastr.error(res.message || 'Failed to reject booking', 'Error');
        }
      },
      error: (err) => {
        const fallbackUrl = `${this.fallbackAdminUrl}/${this.selectedBooking!.id}/reject`;
        this.http.put<any>(fallbackUrl, payload, { headers: this.getHeaders() }).subscribe({
          next: (r) => {
            this.isSubmittingReject = false;
            this.toastr.success(r.message || 'Booking rejected successfully', 'Rejected');
            modal.close();
            this.refreshCurrentView();
          },
          error: (e) => {
            this.isSubmittingReject = false;
            console.error('Error rejecting booking:', e);
            this.toastr.error(e.error?.message || err.error?.message || 'Server error while rejecting booking', 'Error');
          }
        });
      }
    });
  }

  // --- Edit Meet Link Modal ---
  openEditMeetModal(booking: MentorBooking, content: any, fromViewModal?: any): void {
    if (fromViewModal) {
      fromViewModal.dismiss();
    }
    this.selectedBooking = booking;
    this.editMeetUrl = booking.google_meet_url || '';
    this.editMeetNotes = booking.meeting_notes || '';
    this.isSubmittingEditMeet = false;

    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  submitEditMeet(modal: any): void {
    if (!this.selectedBooking) return;
    if (!this.editMeetUrl.trim()) {
      this.toastr.warning('Please enter meeting URL.', 'Validation');
      return;
    }

    this.isSubmittingEditMeet = true;
    const url = `${this.mentorBookingsAdminUrl}/${this.selectedBooking.id}/meeting-link`;
    const payload = {
      google_meet_url: this.editMeetUrl.trim(),
      meeting_notes: this.editMeetNotes.trim()
    };

    this.http.put<any>(url, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isSubmittingEditMeet = false;
        if (res.status || res.success) {
          this.toastr.success(res.message || 'Meeting link updated successfully!', 'Success');
          modal.close();
          this.refreshCurrentView();
        } else {
          this.toastr.error(res.message || 'Failed to update meeting link', 'Error');
        }
      },
      error: (err) => {
        const fallbackUrl = `${this.fallbackAdminUrl}/${this.selectedBooking!.id}/meeting-link`;
        this.http.put<any>(fallbackUrl, payload, { headers: this.getHeaders() }).subscribe({
          next: (r) => {
            this.isSubmittingEditMeet = false;
            this.toastr.success(r.message || 'Meeting link updated successfully!', 'Success');
            modal.close();
            this.refreshCurrentView();
          },
          error: (e) => {
            this.isSubmittingEditMeet = false;
            console.error('Error updating meet link:', e);
            this.toastr.error(e.error?.message || err.error?.message || 'Server error while updating meeting link', 'Error');
          }
        });
      }
    });
  }

  // --- Mark Session Completed ---
  markSessionCompleted(booking: MentorBooking, modalToClose?: any): void {
    if (!confirm(`Mark session for Booking #${booking.booking_number} as Completed?`)) {
      return;
    }

    const url = `${this.mentorBookingsAdminUrl}/${booking.id}/complete`;
    this.http.put<any>(url, {}, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.status || res.success) {
          this.toastr.success(res.message || 'Session marked as completed successfully!', 'Completed');
          if (modalToClose) {
            modalToClose.dismiss();
          }
          this.refreshCurrentView();
        } else {
          this.toastr.error(res.message || 'Failed to complete session', 'Error');
        }
      },
      error: (err) => {
        const fallbackUrl = `${this.fallbackAdminUrl}/${booking.id}/complete`;
        this.http.put<any>(fallbackUrl, {}, { headers: this.getHeaders() }).subscribe({
          next: (r) => {
            this.toastr.success(r.message || 'Session marked as completed successfully!', 'Completed');
            if (modalToClose) {
              modalToClose.dismiss();
            }
            this.refreshCurrentView();
          },
          error: (e) => {
            console.error('Error completing session:', e);
            this.toastr.error(e.error?.message || err.error?.message || 'Server error while completing session', 'Error');
          }
        });
      }
    });
  }

  refreshAll(): void {
    if (this.activeViewMode === 'slot_wise') {
      this.loadSlotWiseBookings();
    } else if (this.activeViewMode === 'webhooks') {
      this.loadWebhookEvents();
    } else {
      this.loadBookings();
      this.loadKpiCounts();
    }
  }

  private refreshCurrentView(): void {
    this.refreshAll();
  }

  copyMeetLink(url: string | null | undefined): void {
    this.copyToClipboard(url, 'Google Meet link');
  }
}
