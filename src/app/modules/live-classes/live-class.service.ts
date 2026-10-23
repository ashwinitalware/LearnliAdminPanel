import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

export type ClassType = 'group' | 'individual';
export type LiveClassStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
export type SessionStatus = 'not_provisioned' | 'scheduled' | 'live' | 'ended' | 'cancelled';
export type AttendanceStatus = 'present' | 'partially_attended' | 'absent';

export interface LiveClassCapacity {
  max_students: number;
  enrolled_count: number;
  available_seats: number;
  is_full: boolean;
}

export interface LiveClassPricing {
  use_mentor_default: boolean;
  fees: number;
  discounted_fees: number;
  effective_fee: number;
  is_free: boolean;
}

export interface LiveClassMentor {
  id: number;
  full_name: string;
  qualification?: string;
  mobile_number?: string;
  email?: string;
  photo?: string;
  expert_in?: string;
  experience?: string;
  default_charges: number;
}

export interface LiveClassSession {
  id: number;
  status: SessionStatus;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  recording_url?: string | null;
}

export interface LiveClass {
  id: number;
  mentor_id: number;
  subject: string;
  title: string;
  topic?: string | null;
  description?: string | null;
  discussion_points?: string[] | null;
  learning_outcomes?: string[] | null;
  class_type: ClassType;
  class_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  timezone: string;
  pricing: LiveClassPricing;
  capacity: LiveClassCapacity;
  thumbnail?: string | null;
  provider?: string;
  provider_session_id?: string | null;
  status: LiveClassStatus;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
  mentor?: LiveClassMentor;
  session?: LiveClassSession | null;
  // Flat properties returned in list query
  mentor_name?: string;
  mentor_email?: string;
  mentor_mobile?: string;
  mentor_photo?: string;
  mentor_qualification?: string;
  mentor_expert_in?: string;
  mentor_experience?: string;
  mentor_default_charges?: number;
  session_status?: SessionStatus;
  fees?: number;
  discounted_fees?: number;
  effective_fee?: number;
  is_free?: boolean;
  enrolled_count?: number;
  max_students?: number;
  available_seats?: number;
  [key: string]: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  class_title?: string;
  class_date?: string;
  capacity?: LiveClassCapacity;
}

export interface LiveClassBooking {
  id: number;
  booking_reference: string;
  amount: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  payment_status: 'free' | 'pending' | 'paid' | 'failed' | 'refunded';
  hold_expires_at?: string | null;
  booked_at?: string;
  student_id: number;
  student_name: string;
  student_email: string;
  student_mobile: string;
  payment_id?: string | null;
  attendance_intervals_count?: number;
}

export interface LiveClassPayment {
  id: number;
  booking_id: number;
  booking_reference: string;
  student_id: number;
  student_name: string;
  student_email: string;
  student_mobile: string;
  transaction_id?: string | null;
  payment_gateway: string;
  gateway_order_id?: string | null;
  gateway_payment_id?: string | null;
  amount: number;
  currency: string;
  payment_status: string;
  created_at?: string;
}

export interface LiveClassAttendanceRecord {
  booking_id: number;
  booking_reference: string;
  student_id: number;
  student_name: string;
  student_email: string;
  student_mobile: string;
  total_intervals: number;
  total_duration_seconds: number;
  total_duration_minutes: number;
  first_joined_at?: string | null;
  last_left_at?: string | null;
  attendance_status: AttendanceStatus;
}

export interface WebinarSessionMetadata {
  live_class_id: number;
  class_title: string;
  class_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  class_status: LiveClassStatus;
  session_status: SessionStatus;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  is_join_open: boolean;
  join_restriction_reason?: string | null;
  room_url?: string | null;
  provider?: string;
  provider_session_id?: string | null;
}

export interface LiveClassDashboardStats {
  totalClasses: number;
  draftClasses: number;
  upcomingClasses: number;
  liveClasses: number;
  completedClasses: number;
  cancelledClasses: number;
  totalBookings: number;
  totalRevenue: number;
  upcomingList: LiveClass[];
  liveList: LiveClass[];
}

export interface SubjectOption {
  id: number;
  subject_name: string;
  category_id?: number;
  subcategory_id?: number;
}

export interface MentorOption {
  id: number;
  full_name: string;
  email?: string;
  mobile_number?: string;
  qualification?: string;
  expert_in?: string;
  experience?: string;
  default_charges?: number;
  photo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LiveClassService {
  private readonly adminBaseUrl = `${environment.apiUrl}/admin/live-classes`;
  private readonly sessionBaseUrl = `${environment.apiUrl}/live-classes`;
  private readonly mentorBaseUrl = `${environment.apiUrl}/mentor`;
  private readonly subjectBaseUrl = `${environment.apiUrl}/subject`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`)
                       .set('X-Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // ==========================================
  // 1. LIVE CLASSES CRUD & STATUS
  // ==========================================

  getLiveClasses(params?: {
    mentor_id?: number;
    subject?: string;
    status?: string;
    class_type?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
    limit?: number;
    order_by?: string;
    order_dir?: string;
  }): Observable<ApiResponse<LiveClass[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const val = (params as any)[key];
        if (val !== undefined && val !== null && val !== '' && val !== 'all') {
          httpParams = httpParams.set(key, String(val));
        }
      });
    }

    return this.http.get<ApiResponse<LiveClass[]>>(this.adminBaseUrl, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getLiveClassById(id: number): Observable<ApiResponse<LiveClass>> {
    return this.http.get<ApiResponse<LiveClass>>(`${this.adminBaseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  createLiveClass(formData: FormData): Observable<ApiResponse<LiveClass>> {
    // Note: Do not set Content-Type header manually for FormData so browser sets multipart boundary
    const headers = this.getHeaders();
    return this.http.post<ApiResponse<LiveClass>>(this.adminBaseUrl, formData, {
      headers
    });
  }

  updateLiveClass(id: number, formData: FormData): Observable<ApiResponse<LiveClass>> {
    const headers = this.getHeaders();
    return this.http.put<ApiResponse<LiveClass>>(`${this.adminBaseUrl}/${id}`, formData, {
      headers
    });
  }

  deleteLiveClass(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.adminBaseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateClassStatus(id: number, status: LiveClassStatus): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.adminBaseUrl}/${id}/status`, { status }, {
      headers: this.getHeaders().set('Content-Type', 'application/json')
    });
  }

  // ==========================================
  // 2. WEBINAR.GG SESSION MANAGEMENT
  // ==========================================

  provisionSession(classId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.sessionBaseUrl}/${classId}/session/create`, {}, {
      headers: this.getHeaders()
    });
  }

  startSession(classId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.sessionBaseUrl}/${classId}/session/start`, {}, {
      headers: this.getHeaders()
    });
  }

  endSession(classId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.sessionBaseUrl}/${classId}/session/end`, {}, {
      headers: this.getHeaders()
    });
  }

  getSessionDetails(classId: number): Observable<ApiResponse<WebinarSessionMetadata>> {
    return this.http.get<ApiResponse<WebinarSessionMetadata>>(`${this.sessionBaseUrl}/${classId}/session`, {
      headers: this.getHeaders()
    });
  }

  // ==========================================
  // 3. BOOKINGS, PAYMENTS & ATTENDANCE
  // ==========================================

  getClassBookings(classId: number, params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<LiveClassBooking[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status && params.status !== 'all') httpParams = httpParams.set('status', params.status);
      if (params.search && params.search.trim()) httpParams = httpParams.set('search', params.search.trim());
      if (params.page) httpParams = httpParams.set('page', String(params.page));
      if (params.limit) httpParams = httpParams.set('limit', String(params.limit));
    }
    return this.http.get<ApiResponse<LiveClassBooking[]>>(`${this.adminBaseUrl}/${classId}/bookings`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getClassPayments(classId: number, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<LiveClassPayment[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status && params.status !== 'all') httpParams = httpParams.set('status', params.status);
      if (params.page) httpParams = httpParams.set('page', String(params.page));
      if (params.limit) httpParams = httpParams.set('limit', String(params.limit));
    }
    return this.http.get<ApiResponse<LiveClassPayment[]>>(`${this.adminBaseUrl}/${classId}/payments`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getClassAttendance(classId: number): Observable<ApiResponse<LiveClassAttendanceRecord[]>> {
    return this.http.get<ApiResponse<LiveClassAttendanceRecord[]>>(`${this.adminBaseUrl}/${classId}/attendance`, {
      headers: this.getHeaders()
    });
  }

  getStudentAttendanceIntervals(classId: number, studentId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.adminBaseUrl}/${classId}/attendance/${studentId}`, {
      headers: this.getHeaders()
    });
  }

  // ==========================================
  // 4. METADATA HELPERS (MENTORS & SUBJECTS)
  // ==========================================

  getMentors(): Observable<MentorOption[]> {
    return this.http.get<any>(this.mentorBaseUrl, { headers: this.getHeaders() }).pipe(
      map(res => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        return list.map((m: any) => ({
          id: Number(m.id),
          full_name: m.full_name || m.name || `Mentor #${m.id}`,
          email: m.email,
          mobile_number: m.mobile_number,
          qualification: m.qualification,
          expert_in: m.expert_in,
          experience: m.experience,
          default_charges: Number(m.default_charges || 0),
          photo: m.photo
        }));
      }),
      catchError(err => {
        console.error('Error fetching mentors:', err);
        return of([]);
      })
    );
  }

  getSubjects(): Observable<SubjectOption[]> {
    return this.http.get<any>(this.subjectBaseUrl, { headers: this.getHeaders() }).pipe(
      map(res => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        return list.map((s: any) => ({
          id: Number(s.id),
          subject_name: s.subject_name || s.name || `Subject #${s.id}`,
          category_id: s.category_id,
          subcategory_id: s.subcategory_id
        }));
      }),
      catchError(err => {
        console.error('Error fetching subjects:', err);
        return of([]);
      })
    );
  }

  // ==========================================
  // 5. DASHBOARD STATS AGGREGATOR
  // ==========================================

  getStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.adminBaseUrl}/statistics`, {
      headers: this.getHeaders()
    });
  }

  getDashboardStats(): Observable<LiveClassDashboardStats> {
    return forkJoin({
      stats: this.getStatistics().pipe(
        catchError(() => of({ success: false, data: null }))
      ),
      liveClasses: this.getLiveClasses({ status: 'ongoing', limit: 10 }).pipe(
        catchError(() => of({ success: false, data: [] as LiveClass[] }))
      ),
      upcomingClasses: this.getLiveClasses({ status: 'published', limit: 10 }).pipe(
        catchError(() => of({ success: false, data: [] as LiveClass[] }))
      ),
      allClasses: this.getLiveClasses({ limit: 100 }).pipe(
        catchError(() => of({ success: false, data: [] as LiveClass[], pagination: { total: 0, page: 1, limit: 100, totalPages: 1 } }))
      )
    }).pipe(
      map(results => {
        const s = results.stats?.data;
        if (s) {
          return {
            totalClasses: Number(s.total_classes || 0),
            draftClasses: Number(s.draft_classes || 0),
            upcomingClasses: Number(s.upcoming_classes || 0),
            liveClasses: Number(s.live_classes || 0),
            completedClasses: Number(s.completed_classes || 0),
            cancelledClasses: Number(s.cancelled_classes || 0),
            totalBookings: Number(s.total_bookings || 0),
            totalRevenue: Number(s.total_revenue || 0),
            upcomingList: results.upcomingClasses?.data || [],
            liveList: results.liveClasses?.data || []
          };
        }

        // Graceful fallback to client-side tally if stats endpoint fails
        const classes = results.allClasses.data || [];
        let draft = 0, published = 0, ongoing = 0, completed = 0, cancelled = 0;
        let totalBookings = 0, totalRevenue = 0;

        classes.forEach(c => {
          if (c.status === 'draft') draft++;
          else if (c.status === 'published') published++;
          else if (c.status === 'ongoing') ongoing++;
          else if (c.status === 'completed') completed++;
          else if (c.status === 'cancelled') cancelled++;

          const enrolled = Number(c.capacity?.enrolled_count || c['enrolled_count'] || 0);
          totalBookings += enrolled;
          const fee = Number(c.pricing?.effective_fee || c['effective_fee'] || c['discounted_fees'] || c['fees'] || 0);
          totalRevenue += (enrolled * fee);
        });

        return {
          totalClasses: results.allClasses.pagination?.total || classes.length,
          draftClasses: draft,
          upcomingClasses: published,
          liveClasses: ongoing,
          completedClasses: completed,
          cancelledClasses: cancelled,
          totalBookings,
          totalRevenue,
          upcomingList: results.upcomingClasses?.data || [],
          liveList: results.liveClasses?.data || []
        };
      })
    );
  }


  // ==========================================
  // 6. ASSET URL HELPER
  // ==========================================

  getAssetUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${environment.baseUrl}/${cleanPath}`;
  }
}
