import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../shared/services/auth.service';

export interface CourseOption {
  id: number;
  course_name: string;
  category_id?: number;
  category_name?: string;
  subcategory_id?: number;
  subcategory_name?: string;
  subject_id?: number;
  subject_name?: string;
  mentor_id?: number;
  mentor_name?: string;
  language?: string;
  price?: number | string;
  discount_type?: string;
  discount_value?: number | string;
  discounted_price?: number | string;
  image?: string;
  status?: string;
  description?: string;
  chapters_count?: number;
  average_rating?: number;
  total_reviews?: number;
  mentor?: {
    id?: number;
    full_name?: string;
    qualification?: string;
    mobile_number?: string;
    email?: string;
    photo?: string;
    about_us?: string;
    expert_in?: string;
    experience?: string;
  };
}

export interface HomeSectionItem {
  id: number;
  title: string;
  section_name?: string;
  name?: string;
  status: 'active' | 'inactive';
  sort_order: number;
  course_ids?: number[];
  courses_count?: number;
  courses?: CourseOption[];
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class HomeSectionService {
  private readonly baseUrl = `${environment.apiUrl}/home-sections`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() || localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Fetch All Courses (For Multi-Select Dropdown)
  getAllCourses(): Observable<ApiResponse<CourseOption[]>> {
    return this.http.get<ApiResponse<CourseOption[]>>(`${environment.apiUrl}/course`, {
      headers: this.getAuthHeaders(),
    });
  }

  // 1. Get All Sections (Optional filter by status: 'active' | 'inactive')
  getSections(status?: string): Observable<ApiResponse<HomeSectionItem[]>> {
    let params = new HttpParams();
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<HomeSectionItem[]>>(this.baseUrl, { params });
  }

  // 2. Add New Section
  createSection(payload: { title: string; status?: string; sort_order?: number; course_ids?: number[] }): Observable<ApiResponse<HomeSectionItem>> {
    return this.http.post<ApiResponse<HomeSectionItem>>(this.baseUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  // 3. Get Single Section by ID
  getSectionById(id: number): Observable<ApiResponse<HomeSectionItem>> {
    return this.http.get<ApiResponse<HomeSectionItem>>(`${this.baseUrl}/${id}`);
  }

  // 4. Update Section
  updateSection(id: number, payload: { title: string; status?: string; sort_order?: number; course_ids?: number[] }): Observable<ApiResponse<HomeSectionItem>> {
    return this.http.put<ApiResponse<HomeSectionItem>>(`${this.baseUrl}/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  // 5. Status Toggle (Active / Inactive)
  toggleStatus(id: number, status: 'active' | 'inactive'): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(
      `${this.baseUrl}/status/${id}`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  // 6. Delete Section
  deleteSection(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // 7. Reorder Sections
  reorderSections(order: number[]): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${this.baseUrl}/reorder`,
      { order },
      { headers: this.getAuthHeaders() }
    );
  }
}
