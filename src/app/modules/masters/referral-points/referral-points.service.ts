import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../shared/services/auth.service';

export interface ReferralPointsConfig {
  id: number;
  points: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateReferralPointsDto {
  points: number;
  status?: 'active' | 'inactive' | number;
}

export interface UpdateReferralPointsDto {
  points?: number;
  status?: 'active' | 'inactive' | number;
}

export interface PaginationMeta {
  total_items: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

@Injectable({
  providedIn: 'root'
})
export class ReferralPointsService {
  private readonly baseUrl = `${environment.apiUrl}/referral-points`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`)
                       .set('X-Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * 1. Create a new referral reward points configuration.
   * If status is 'active', backend will automatically deactivate other active configurations.
   */
  createReferralPoints(payload: CreateReferralPointsDto): Observable<ApiResponse<ReferralPointsConfig>> {
    return this.http.post<ApiResponse<ReferralPointsConfig>>(this.baseUrl, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * 2. Fetch list of all referral points configurations.
   * Optional query params: status ('active' | 'inactive'), page, limit.
   */
  getReferralPoints(params?: { status?: string; page?: number; limit?: number }): Observable<ApiResponse<ReferralPointsConfig[]>> {
    let httpParams = new HttpParams();
    if (params?.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    return this.http.get<ApiResponse<ReferralPointsConfig[]>>(this.baseUrl, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  /**
   * 3. Retrieve the single active referral points configuration currently applied across the system.
   */
  getActiveReferralPoints(): Observable<ApiResponse<ReferralPointsConfig>> {
    return this.http.get<ApiResponse<ReferralPointsConfig>>(`${this.baseUrl}/active`, {
      headers: this.getHeaders()
    });
  }

  /**
   * 4. Retrieve a specific configuration by ID.
   */
  getReferralPointsById(id: number): Observable<ApiResponse<ReferralPointsConfig>> {
    return this.http.get<ApiResponse<ReferralPointsConfig>>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * 5. Update points value and/or status of a configuration.
   */
  updateReferralPoints(id: number, payload: UpdateReferralPointsDto): Observable<ApiResponse<ReferralPointsConfig>> {
    return this.http.put<ApiResponse<ReferralPointsConfig>>(`${this.baseUrl}/${id}`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * 6. Toggle status (Active / Inactive) of a configuration.
   */
  toggleStatus(id: number, status: 'active' | 'inactive'): Observable<ApiResponse<ReferralPointsConfig>> {
    return this.http.patch<ApiResponse<ReferralPointsConfig>>(
      `${this.baseUrl}/status/${id}`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  /**
   * 7. Delete an inactive referral points configuration.
   */
  deleteReferralPoints(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
