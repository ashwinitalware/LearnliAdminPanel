import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';
import {
  AdminWalletService,
  WalletStatistics,
  WalletUser,
  WalletTransaction,
  UserWalletDetails,
  AdjustWalletDto,
  PaginationMeta
} from './wallet.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss'
})
export class Wallet implements OnInit {
  @ViewChild('viewDetailsModal') viewDetailsModalRef!: TemplateRef<any>;
  @ViewChild('adjustModal') adjustModalRef!: TemplateRef<any>;

  // Summary Statistics
  statistics: WalletStatistics = {
    total_wallet_users: 0,
    total_wallet_points: 0,
    total_credits: 0,
    total_debits: 0
  };
  isLoadingStats: boolean = false;
  hasStatsError: boolean = false;

  // User Wallet List
  walletUsers: WalletUser[] = [];
  isLoadingUsers: boolean = false;
  hasUsersError: boolean = false;
  searchTerm: string = '';
  private searchDebounceTimer: any;

  // Users Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalUsersCount: number = 0;
  totalPages: number = 1;

  // Selected User for Details Modal
  selectedUser: WalletUser | null = null;
  userDetails: UserWalletDetails | null = null;
  isLoadingDetails: boolean = false;

  // Transactions Ledger inside Details Modal
  userTransactions: WalletTransaction[] = [];
  isLoadingTransactions: boolean = false;
  txnTypeFilter: string = 'all';
  txnReferenceFilter: string = 'all';
  txnCurrentPage: number = 1;
  txnPageSize: number = 10;
  txnTotalCount: number = 0;
  txnTotalPages: number = 1;

  // Manual Adjustment Form State
  adjustTargetUser: WalletUser | null = null;
  adjustType: 'credit' | 'debit' = 'credit';
  adjustAmount: number | null = null;
  adjustReason: string = '';
  isSubmittingAdjustment: boolean = false;

  // Modal References
  detailsModalRef?: NgbModalRef;
  adjustModalRefInstance?: NgbModalRef;

  // Quick chips for reasons
  quickReasons: string[] = [
    'Promotional Reward',
    'Campaign Bonus',
    'Manual Correction',
    'Event Participation Bonus',
    'Goodwill Credit',
    'Dispute Resolution'
  ];

  constructor(
    private walletService: AdminWalletService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken() || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!token) {
      this.toastr.warning('Please log in first.', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadAll();
  }

  loadAll(): void {
    this.loadStatistics();
    this.loadUsers();
  }

  // ==========================================
  // ========== 1. SUMMARY STATISTICS ==========
  // ==========================================

  loadStatistics(): void {
    this.isLoadingStats = true;
    this.hasStatsError = false;

    this.walletService.getStatistics().subscribe({
      next: (res) => {
        this.isLoadingStats = false;
        if (res.success && res.data) {
          this.statistics = {
            total_wallet_users: Number(res.data.total_wallet_users || 0),
            total_wallet_points: Number(res.data.total_wallet_points || 0),
            total_credits: Number(res.data.total_credits || 0),
            total_debits: Number(res.data.total_debits || 0)
          };
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingStats = false;
        this.hasStatsError = true;
        console.error('Error loading wallet statistics:', err);
        this.toastr.error(err.error?.message || 'Failed to load wallet summary statistics.', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // ============ 2. USER WALLETS =============
  // ==========================================

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.hasUsersError = false;

    this.walletService.getUsers({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm
    }).subscribe({
      next: (res) => {
        this.isLoadingUsers = false;
        if (res.success && Array.isArray(res.data)) {
          this.walletUsers = res.data;
          if (res.pagination) {
            this.totalUsersCount = res.pagination.total_items;
            this.totalPages = res.pagination.total_pages;
            this.currentPage = res.pagination.page;
          } else {
            this.totalUsersCount = res.data.length;
            this.totalPages = Math.ceil(this.totalUsersCount / this.pageSize) || 1;
          }
        } else {
          this.walletUsers = [];
          this.totalUsersCount = 0;
          this.totalPages = 1;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingUsers = false;
        this.hasUsersError = true;
        this.walletUsers = [];
        console.error('Error loading wallet users:', err);
        this.toastr.error(err.error?.message || 'Failed to load user wallets list.', 'Error');
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
      this.loadUsers();
    }, 350);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadUsers();
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadUsers();
  }

  // ==========================================
  // ====== 3. USER DETAILS & TRANSACTIONS =====
  // ==========================================

  openUserDetailsModal(user: WalletUser, content: TemplateRef<any>): void {
    this.selectedUser = user;
    this.userDetails = null;
    this.userTransactions = [];
    this.txnTypeFilter = 'all';
    this.txnReferenceFilter = 'all';
    this.txnCurrentPage = 1;

    this.detailsModalRef = this.modalService.open(content, {
      size: 'xl',
      centered: true,
      scrollable: true,
      backdrop: 'static'
    });

    this.loadUserDetails(user.user_id);
    this.loadUserTransactions(user.user_id);
  }

  loadUserDetails(userId: number): void {
    this.isLoadingDetails = true;
    this.walletService.getUserDetails(userId).subscribe({
      next: (res) => {
        this.isLoadingDetails = false;
        if (res.success && res.data) {
          this.userDetails = res.data;
          // Update selected user balances in list if altered
          if (this.selectedUser && this.selectedUser.user_id === userId) {
            this.selectedUser.balance = res.data.wallet.balance;
            this.selectedUser.total_credits = res.data.wallet.total_credits;
            this.selectedUser.total_debits = res.data.wallet.total_debits;
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingDetails = false;
        console.error('Error loading user details:', err);
        this.toastr.error(err.error?.message || 'Failed to fetch user wallet details.', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  loadUserTransactions(userId: number): void {
    this.isLoadingTransactions = true;
    this.walletService.getUserTransactions(userId, {
      page: this.txnCurrentPage,
      limit: this.txnPageSize,
      type: this.txnTypeFilter !== 'all' ? this.txnTypeFilter : undefined,
      reference_type: this.txnReferenceFilter !== 'all' ? this.txnReferenceFilter : undefined
    }).subscribe({
      next: (res) => {
        this.isLoadingTransactions = false;
        if (res.success && Array.isArray(res.data)) {
          this.userTransactions = res.data;
          if (res.pagination) {
            this.txnTotalCount = res.pagination.total_items;
            this.txnTotalPages = res.pagination.total_pages;
            this.txnCurrentPage = res.pagination.page;
          } else {
            this.txnTotalCount = res.data.length;
            this.txnTotalPages = Math.ceil(this.txnTotalCount / this.txnPageSize) || 1;
          }
        } else {
          this.userTransactions = [];
          this.txnTotalCount = 0;
          this.txnTotalPages = 1;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingTransactions = false;
        this.userTransactions = [];
        console.error('Error loading user transactions:', err);
        this.toastr.error(err.error?.message || 'Failed to load transaction history.', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  onTxnFilterChange(): void {
    if (!this.selectedUser) return;
    this.txnCurrentPage = 1;
    this.loadUserTransactions(this.selectedUser.user_id);
  }

  changeTxnPage(page: number): void {
    if (!this.selectedUser || page < 1 || page > this.txnTotalPages || page === this.txnCurrentPage) return;
    this.txnCurrentPage = page;
    this.loadUserTransactions(this.selectedUser.user_id);
  }

  // ==========================================
  // ======== 4. MANUAL ADJUSTMENT MODAL =======
  // ==========================================

  openAdjustModal(user: WalletUser, content: TemplateRef<any>): void {
    this.adjustTargetUser = user;
    this.adjustType = 'credit';
    this.adjustAmount = null;
    this.adjustReason = '';
    this.isSubmittingAdjustment = false;

    this.adjustModalRefInstance = this.modalService.open(content, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
  }

  selectQuickReason(reason: string): void {
    this.adjustReason = reason;
  }

  submitAdjustment(modal: any): void {
    if (!this.adjustTargetUser) return;

    if (this.adjustAmount === null || this.adjustAmount === undefined || isNaN(this.adjustAmount)) {
      this.toastr.error('Please enter a valid points amount.', 'Validation Error');
      return;
    }

    const pointsNum = Number(this.adjustAmount);
    if (pointsNum <= 0) {
      this.toastr.error('Wallet Points must be a valid positive number greater than 0.', 'Validation Error');
      return;
    }

    if (this.adjustType === 'debit') {
      const currentBalance = Number(this.adjustTargetUser.balance || 0);
      if (pointsNum > currentBalance) {
        this.toastr.error(
          `Cannot debit ${pointsNum} points. Current balance is only ${currentBalance} points.`,
          'Insufficient Balance'
        );
        return;
      }
    }

    const payload: AdjustWalletDto = {
      user_id: this.adjustTargetUser.user_id,
      type: this.adjustType,
      amount: pointsNum,
      reason: this.adjustReason.trim() || undefined
    };

    this.isSubmittingAdjustment = true;
    this.walletService.adjustWallet(payload).subscribe({
      next: (res) => {
        this.isSubmittingAdjustment = false;
        if (res.success) {
          this.toastr.success(
            res.message || `Wallet ${this.adjustType}ed successfully by ${pointsNum} points!`,
            'Success'
          );
          modal.close();

          // Refresh statistics
          this.loadStatistics();

          // Refresh users list
          this.loadUsers();

          // If user details modal is open for this user, refresh it
          if (this.selectedUser && this.selectedUser.user_id === this.adjustTargetUser!.user_id) {
            this.loadUserDetails(this.selectedUser.user_id);
            this.loadUserTransactions(this.selectedUser.user_id);
          }
        } else {
          this.toastr.error(res.message || 'Failed to adjust wallet.', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmittingAdjustment = false;
        console.error('Error adjusting wallet:', err);
        this.toastr.error(err.error?.message || 'Server error while adjusting wallet.', 'Adjustment Failed');
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // =========== 5. UI HELPER METHODS ==========
  // ==========================================

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  getReferenceBadgeClass(refType: string): string {
    switch (refType?.toLowerCase()) {
      case 'referral':
        return 'bg-success-transparent text-success border border-success-subtle';
      case 'course':
        return 'bg-primary-transparent text-primary border border-primary-subtle';
      case 'pdf':
        return 'bg-warning-transparent text-warning border border-warning-subtle';
      case 'audiobook':
      case 'audio':
        return 'bg-info-transparent text-info border border-info-subtle';
      case 'admin':
        return 'bg-purple-transparent text-purple border border-purple-subtle';
      default:
        return 'bg-secondary-transparent text-secondary';
    }
  }

  getReferenceIcon(refType: string): string {
    switch (refType?.toLowerCase()) {
      case 'referral': return 'ri-share-forward-line';
      case 'course': return 'ri-graduation-cap-line';
      case 'pdf': return 'ri-file-pdf-line';
      case 'audiobook':
      case 'audio': return 'ri-headphone-line';
      case 'admin': return 'ri-shield-user-line';
      default: return 'ri-wallet-3-line';
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getTxnPagesArray(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.txnCurrentPage - 2);
    let end = Math.min(this.txnTotalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}