import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../shared/services/auth.service';

export interface WalletStatistics {
  total_wallet_users: number;
  total_wallet_points: number;
  total_credits: number;
  total_debits: number;
}

export interface WalletLastTransaction {
  type: 'credit' | 'debit';
  amount: number;
  reference_type: string;
  description: string;
  created_at: string;
}

export interface WalletUser {
  user_id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  wallet_id: number | null;
  balance: number;
  total_credits: number;
  total_debits: number;
  created_at: string;
  last_transaction?: WalletLastTransaction | null;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  user_id: number;
  type: 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type: string;
  reference_id?: string | null;
  description?: string | null;
  metadata?: any;
  created_at: string;
}

export interface UserWalletDetails {
  user: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    role: string;
    status: string;
    created_at: string;
  };
  wallet: {
    wallet_id: number;
    user_id: number;
    balance: number;
    total_credits: number;
    total_debits: number;
    created_at: string;
    updated_at: string;
  };
}

export interface AdjustWalletDto {
  user_id: number;
  type: 'credit' | 'debit';
  amount: number;
  reason?: string;
}

export interface PaginationMeta {
  total_items: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page?: boolean;
  has_prev_page?: boolean;
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
export class AdminWalletService {
  private readonly baseUrl = `${environment.apiUrl}/admin/wallet`;

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
   * 1. Fetch system-wide wallet summary statistics.
   */
  getStatistics(): Observable<ApiResponse<WalletStatistics>> {
    return this.http.get<ApiResponse<WalletStatistics>>(`${this.baseUrl}/statistics`, {
      headers: this.getHeaders()
    });
  }

  /**
   * 2. Fetch paginated list of users with their wallet info and total credits/debits.
   */
  getUsers(params?: { page?: number; limit?: number; search?: string }): Observable<ApiResponse<WalletUser[]>> {
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

    return this.http.get<ApiResponse<WalletUser[]>>(`${this.baseUrl}/users`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  /**
   * 3. Fetch specific user details with wallet summary.
   */
  getUserDetails(userId: number): Observable<ApiResponse<UserWalletDetails>> {
    return this.http.get<ApiResponse<UserWalletDetails>>(`${this.baseUrl}/users/${userId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * 4. Fetch filtered & paginated transaction history for a specific user.
   */
  getUserTransactions(userId: number, params?: {
    page?: number;
    limit?: number;
    type?: string;
    reference_type?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<ApiResponse<WalletTransaction[]>> {
    let httpParams = new HttpParams();
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.type && params.type !== 'all') {
      httpParams = httpParams.set('type', params.type);
    }
    if (params?.reference_type && params.reference_type !== 'all') {
      httpParams = httpParams.set('reference_type', params.reference_type);
    }
    if (params?.start_date) {
      httpParams = httpParams.set('start_date', params.start_date);
    }
    if (params?.end_date) {
      httpParams = httpParams.set('end_date', params.end_date);
    }

    return this.http.get<ApiResponse<WalletTransaction[]>>(`${this.baseUrl}/users/${userId}/transactions`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  /**
   * 5. Admin manual adjustment (Credit or Debit) for a user's wallet.
   */
  adjustWallet(payload: AdjustWalletDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/adjust`, payload, {
      headers: this.getHeaders()
    });
  }
}
