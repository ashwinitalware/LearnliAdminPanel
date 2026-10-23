import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

export type CouponType = 'percentage_discount' | 'fixed_discount' | 'wallet_credit' | 'free_access';
export type ProductType = 'course' | 'pdf' | 'audiobook';

export interface CouponProductMapping {
  id: number;
  coupon_id: number;
  product_type: ProductType;
  product_id: number;
  product_name?: string;
  title?: string;
  price?: number;
  created_at?: string;
}

export interface Coupon {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  coupon_type: CouponType;
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number | null;
  wallet_credit_points: number;
  free_access_type?: ProductType | string | null;
  free_access_item_id?: number | null;
  free_access_item_name?: string | null;
  usage_limit?: number | null;
  per_user_limit: number;
  used_count: number;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: number | boolean;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
  product_mappings?: CouponProductMapping[];
  products?: CouponProductMapping[];
}

export interface CouponStatistics {
  total_coupons: number;
  active_coupons: number;
  expired_coupons: number;
  total_redemptions: number;
  total_discount_given: number;
  total_wallet_points_credited: number;
}

export interface CouponUsageItem {
  id: number;
  coupon_id: number;
  user_id: number;
  order_id?: number | null;
  discount_amount: number;
  wallet_credit_points: number;
  coupon_type: string;
  used_at: string;
  created_at?: string;
  user_name?: string;
  full_name?: string;
  user_email?: string;
  email?: string;
  user_mobile?: string;
  mobile?: string;
  order_total?: number;
  payment_status?: string;
}

export interface CreateCouponDto {
  code: string;
  title: string;
  description?: string | null;
  coupon_type: CouponType;
  discount_value?: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number | null;
  wallet_credit_points?: number;
  free_access_type?: ProductType | string | null;
  free_access_item_id?: number | null;
  usage_limit?: number | null;
  per_user_limit?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: number | boolean;
  product_mappings?: { product_type: string; product_id: number }[];
}

export interface UpdateCouponDto {
  code?: string;
  title?: string;
  description?: string | null;
  coupon_type?: CouponType;
  discount_value?: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number | null;
  wallet_credit_points?: number;
  free_access_type?: ProductType | string | null;
  free_access_item_id?: number | null;
  usage_limit?: number | null;
  per_user_limit?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: number | boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export interface CouponListResponse {
  coupons: Coupon[];
  pagination: PaginationMeta;
}

export interface CouponUsageResponse {
  coupon: Partial<Coupon>;
  usages: CouponUsageItem[];
  pagination: PaginationMeta;
}

export interface SelectableProduct {
  id: number;
  type: ProductType;
  title: string;
  price?: number;
  image?: string;
  category_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private readonly baseUrl = `${environment.apiUrl}/admin/coupons`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
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
   * 1. GET /api/v1/admin/coupons/statistics
   */
  getStatistics(): Observable<ApiResponse<CouponStatistics>> {
    return this.http.get<ApiResponse<CouponStatistics>>(`${this.baseUrl}/statistics`, {
      headers: this.getHeaders()
    });
  }

  /**
   * 2. GET /api/v1/admin/coupons
   * Supports search, coupon_type, is_active, page, limit
   */
  getCoupons(params?: {
    page?: number;
    limit?: number;
    search?: string;
    coupon_type?: string;
    is_active?: number | string;
  }): Observable<ApiResponse<CouponListResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params?.coupon_type && params.coupon_type !== 'all') {
      httpParams = httpParams.set('coupon_type', params.coupon_type);
    }
    if (params?.is_active !== undefined && params.is_active !== '' && params.is_active !== 'all') {
      httpParams = httpParams.set('is_active', params.is_active.toString());
    }

    return this.http.get<ApiResponse<CouponListResponse>>(this.baseUrl, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  /**
   * 3. GET /api/v1/admin/coupons/:id
   */
  getCoupon(id: number): Observable<ApiResponse<Coupon>> {
    return this.http.get<ApiResponse<Coupon>>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * 4. POST /api/v1/admin/coupons
   */
  createCoupon(payload: CreateCouponDto): Observable<ApiResponse<Coupon>> {
    return this.http.post<ApiResponse<Coupon>>(this.baseUrl, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * 5. PUT /api/v1/admin/coupons/:id
   */
  updateCoupon(id: number, payload: UpdateCouponDto): Observable<ApiResponse<Coupon>> {
    return this.http.put<ApiResponse<Coupon>>(`${this.baseUrl}/${id}`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * 6. DELETE /api/v1/admin/coupons/:id
   */
  deleteCoupon(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * 7. PATCH /api/v1/admin/coupons/:id/status
   */
  toggleCouponStatus(id: number, isActive?: boolean | number): Observable<ApiResponse<Coupon>> {
    const payload = isActive !== undefined ? { is_active: isActive ? 1 : 0 } : {};
    return this.http.patch<ApiResponse<Coupon>>(`${this.baseUrl}/${id}/status`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * 8. POST /api/v1/admin/coupons/:id/products
   */
  addCouponProduct(id: number, payload: { product_type: string; product_id: number }): Observable<ApiResponse<{ mapping: any; all_products: CouponProductMapping[] }>> {
    return this.http.post<ApiResponse<{ mapping: any; all_products: CouponProductMapping[] }>>(
      `${this.baseUrl}/${id}/products`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  /**
   * 9. DELETE /api/v1/admin/coupons/:id/products/:mappingId
   */
  removeCouponProduct(id: number, mappingId: number): Observable<ApiResponse<{ all_products: CouponProductMapping[] }>> {
    return this.http.delete<ApiResponse<{ all_products: CouponProductMapping[] }>>(
      `${this.baseUrl}/${id}/products/${mappingId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * 10. GET /api/v1/admin/coupons/:id/usage
   */
  getCouponUsage(id: number, params?: { page?: number; limit?: number }): Observable<ApiResponse<CouponUsageResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ApiResponse<CouponUsageResponse>>(`${this.baseUrl}/${id}/usage`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  /**
   * 11. Helper to fetch all active Courses for product mappings and free-access selection
   */
  getCourses(): Observable<SelectableProduct[]> {
    return this.http.get<any>(`${environment.apiUrl}/course`, { headers: this.getHeaders() }).pipe(
      map(res => {
        const list = res?.data || res?.courses || (Array.isArray(res) ? res : []);
        return list.map((c: any) => ({
          id: c.id,
          type: 'course' as ProductType,
          title: c.course_name || c.title || `Course #${c.id}`,
          price: parseFloat(c.discounted_price || c.price || 0),
          image: c.image,
          category_name: c.category_name
        }));
      })
    );
  }

  /**
   * 12. Helper to fetch all active PDFs for product mappings and free-access selection
   */
  getPdfs(): Observable<SelectableProduct[]> {
    return this.http.get<any>(`${environment.apiUrl}/pdf`, { headers: this.getHeaders() }).pipe(
      map(res => {
        const list = res?.data || res?.pdfs || (Array.isArray(res) ? res : []);
        return list.map((p: any) => ({
          id: p.id,
          type: 'pdf' as ProductType,
          title: p.title || p.pdf_title || `PDF #${p.id}`,
          price: parseFloat(p.price || 0),
          image: p.thumbnail || p.cover_image,
          category_name: p.category_name
        }));
      })
    );
  }

  /**
   * 13. Helper to fetch all active Audiobooks for product mappings and free-access selection
   */
  getAudios(): Observable<SelectableProduct[]> {
    return this.http.get<any>(`${environment.apiUrl}/audio`, { headers: this.getHeaders() }).pipe(
      map(res => {
        const list = res?.data || res?.audios || (Array.isArray(res) ? res : []);
        return list.map((a: any) => ({
          id: a.id,
          type: 'audiobook' as ProductType,
          title: a.audio_title || a.title || `Audiobook #${a.id}`,
          price: parseFloat(a.price || 0),
          image: a.thumbnail || a.cover_image,
          category_name: a.category_name
        }));
      })
    );
  }
}
