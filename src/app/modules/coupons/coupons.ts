import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import {
  CouponService,
  Coupon,
  CouponStatistics,
  CouponUsageItem,
  CouponProductMapping,
  CouponType,
  ProductType,
  SelectableProduct,
  CreateCouponDto,
  UpdateCouponDto
} from './coupon.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './coupons.html',
  styleUrl: './coupons.scss'
})
export class CouponsComponent implements OnInit {
  @ViewChild('couponFormModal') couponFormModalRef!: TemplateRef<any>;
  @ViewChild('viewCouponModal') viewCouponModalRef!: TemplateRef<any>;
  @ViewChild('usageHistoryModal') usageHistoryModalRef!: TemplateRef<any>;
  @ViewChild('deleteConfirmModal') deleteConfirmModalRef!: TemplateRef<any>;

  // ==========================================
  // 1. SUMMARY STATISTICS
  // ==========================================
  statistics: CouponStatistics = {
    total_coupons: 0,
    active_coupons: 0,
    expired_coupons: 0,
    total_redemptions: 0,
    total_discount_given: 0,
    total_wallet_points_credited: 0
  };
  isLoadingStats: boolean = false;
  hasStatsError: boolean = false;

  // ==========================================
  // 2. COUPON LIST & FILTERS
  // ==========================================
  coupons: Coupon[] = [];
  filteredCoupons: Coupon[] = [];
  isLoadingCoupons: boolean = false;
  hasCouponsError: boolean = false;

  searchTerm: string = '';
  selectedTypeFilter: string = 'all';
  selectedStatusFilter: string = 'all';
  selectedValidityFilter: string = 'all';
  private searchDebounceTimer: any;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 1;

  // Status toggle in-flight tracker
  togglingCouponId: number | null = null;

  // ==========================================
  // 3. PRODUCT CATALOG DATA
  // ==========================================
  allProducts: SelectableProduct[] = [];
  coursesList: SelectableProduct[] = [];
  pdfsList: SelectableProduct[] = [];
  audiosList: SelectableProduct[] = [];
  isLoadingProducts: boolean = false;

  // ==========================================
  // 4. FORM STATE (CREATE / EDIT)
  // ==========================================
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  formId?: number;

  formCode: string = '';
  formTitle: string = '';
  formDescription: string = '';
  formType: CouponType = 'percentage_discount';
  formDiscountValue: number | null = 20;
  formMinOrder: number | null = 0;
  formMaxDiscount: number | null = null;
  formWalletPoints: number | null = 100;
  formFreeAccessType: ProductType = 'course';
  formFreeAccessItemId: number | null = null;
  formUsageLimit: number | null = null;
  formPerUserLimit: number = 1;
  formValidFrom: string = '';
  formValidUntil: string = '';
  formIsActive: boolean = true;
  formApplicability: 'all' | 'specific' = 'all';
  formProductMappings: { product_type: ProductType; product_id: number; title?: string; price?: number }[] = [];

  // Form picker for adding specific product mappings
  formPickerType: ProductType = 'course';
  formPickerProductId: number | null = null;

  formErrors: { [key: string]: string } = {};

  // ==========================================
  // 5. VIEW & DETAILS STATE
  // ==========================================
  selectedCoupon: Coupon | null = null;
  viewPickerType: ProductType = 'course';
  viewPickerProductId: number | null = null;
  isAddingViewMapping: boolean = false;
  removingMappingId: number | null = null;

  // ==========================================
  // 6. USAGE HISTORY STATE
  // ==========================================
  usageCoupon: Partial<Coupon> | null = null;
  usageList: CouponUsageItem[] = [];
  isLoadingUsage: boolean = false;
  usagePage: number = 1;
  usagePageSize: number = 10;
  usageTotalCount: number = 0;
  usageTotalPages: number = 1;

  // ==========================================
  // 7. DELETE CONFIRMATION STATE
  // ==========================================
  deleteTargetCoupon: Coupon | null = null;
  isDeleting: boolean = false;

  // Modal active reference
  private activeModalRef?: NgbModalRef;

  constructor(
    private couponService: CouponService,
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
    this.loadProductsCatalog();
  }

  loadAll(): void {
    this.loadStatistics();
    this.loadCoupons();
  }

  // ==========================================
  // 1. STATISTICS
  // ==========================================
  loadStatistics(): void {
    this.isLoadingStats = true;
    this.hasStatsError = false;

    this.couponService.getStatistics().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.statistics = {
            total_coupons: Number(res.data.total_coupons || 0),
            active_coupons: Number(res.data.active_coupons || 0),
            expired_coupons: Number(res.data.expired_coupons || 0),
            total_redemptions: Number(res.data.total_redemptions || 0),
            total_discount_given: parseFloat(String(res.data.total_discount_given || 0)),
            total_wallet_points_credited: parseFloat(String(res.data.total_wallet_points_credited || 0))
          };
        }
        this.isLoadingStats = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading coupon statistics:', err);
        this.hasStatsError = true;
        this.isLoadingStats = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ==========================================
  // 2. PRODUCT CATALOG (COURSES, PDFS, AUDIOS)
  // ==========================================
  loadProductsCatalog(): void {
    this.isLoadingProducts = true;
    forkJoin({
      courses: this.couponService.getCourses(),
      pdfs: this.couponService.getPdfs(),
      audios: this.couponService.getAudios()
    }).subscribe({
      next: ({ courses, pdfs, audios }) => {
        this.coursesList = courses || [];
        this.pdfsList = pdfs || [];
        this.audiosList = audios || [];
        this.allProducts = [...this.coursesList, ...this.pdfsList, ...this.audiosList];
        this.isLoadingProducts = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Failed to load products catalog:', err);
        this.isLoadingProducts = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ==========================================
  // 3. COUPONS LIST & FILTERING
  // ==========================================
  loadCoupons(): void {
    this.isLoadingCoupons = true;
    this.hasCouponsError = false;

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    if (this.selectedTypeFilter && this.selectedTypeFilter !== 'all') {
      params.coupon_type = this.selectedTypeFilter;
    }
    if (this.selectedStatusFilter === 'active') {
      params.is_active = 1;
    } else if (this.selectedStatusFilter === 'inactive') {
      params.is_active = 0;
    }

    this.couponService.getCoupons(params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.coupons = (res.data.coupons || []).map(c => this.normalizeCoupon(c));
          if (res.data.pagination) {
            this.totalCount = Number(res.data.pagination.total || this.coupons.length);
            this.totalPages = Number(res.data.pagination.total_pages || 1);
            this.currentPage = Number(res.data.pagination.page || this.currentPage);
          } else {
            this.totalCount = this.coupons.length;
            this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
          }
          this.applyLocalValidityFilter();
        }
        this.isLoadingCoupons = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading coupons:', err);
        this.hasCouponsError = true;
        this.isLoadingCoupons = false;
        this.toastr.error(err?.error?.message || 'Failed to fetch coupons.', 'Error');
        this.cdr.markForCheck();
      }
    });
  }

  private normalizeCoupon(c: any): Coupon {
    return {
      ...c,
      id: Number(c.id),
      discount_value: parseFloat(c.discount_value || 0),
      minimum_order_amount: parseFloat(c.minimum_order_amount || 0),
      maximum_discount_amount: c.maximum_discount_amount !== null && c.maximum_discount_amount !== undefined ? parseFloat(c.maximum_discount_amount) : null,
      wallet_credit_points: parseFloat(c.wallet_credit_points || 0),
      used_count: Number(c.used_count || 0),
      usage_limit: c.usage_limit !== null && c.usage_limit !== undefined ? Number(c.usage_limit) : null,
      per_user_limit: Number(c.per_user_limit || 1),
      is_active: Number(c.is_active) === 1,
      product_mappings: Array.isArray(c.product_mappings) ? c.product_mappings : (Array.isArray(c.products) ? c.products : [])
    };
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage = 1;
      this.loadCoupons();
    }, 350);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadCoupons();
  }

  onValidityFilterChange(): void {
    this.applyLocalValidityFilter();
  }

  applyLocalValidityFilter(): void {
    const now = new Date();
    if (this.selectedValidityFilter === 'all') {
      this.filteredCoupons = [...this.coupons];
    } else if (this.selectedValidityFilter === 'valid') {
      this.filteredCoupons = this.coupons.filter(c => {
        const isFromValid = !c.valid_from || new Date(c.valid_from) <= now;
        const isUntilValid = !c.valid_until || new Date(c.valid_until) >= now;
        return isFromValid && isUntilValid && c.is_active;
      });
    } else if (this.selectedValidityFilter === 'expired') {
      this.filteredCoupons = this.coupons.filter(c => c.valid_until && new Date(c.valid_until) < now);
    } else if (this.selectedValidityFilter === 'upcoming') {
      this.filteredCoupons = this.coupons.filter(c => c.valid_from && new Date(c.valid_from) > now);
    }
    this.cdr.markForCheck();
  }

  onPageChange(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCoupons();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadCoupons();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedTypeFilter = 'all';
    this.selectedStatusFilter = 'all';
    this.selectedValidityFilter = 'all';
    this.currentPage = 1;
    this.loadCoupons();
  }

  // ==========================================
  // 4. COUPON VALIDITY HELPERS
  // ==========================================
  getValidityStatus(coupon: Coupon): { label: string; class: string; icon: string } {
    const now = new Date();
    if (!coupon.is_active) {
      return { label: 'Inactive', class: 'badge bg-secondary-transparent text-secondary border border-secondary-subtle', icon: 'ri-close-circle-line' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { label: 'Expired', class: 'badge bg-danger-transparent text-danger border border-danger-subtle', icon: 'ri-time-line' };
    }
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { label: 'Upcoming', class: 'badge bg-warning-transparent text-warning border border-warning-subtle', icon: 'ri-calendar-event-line' };
    }
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { label: 'Exhausted', class: 'badge bg-dark-transparent text-dark border border-dark-subtle', icon: 'ri-flag-line' };
    }
    return { label: 'Active & Valid', class: 'badge bg-success-transparent text-success border border-success-subtle', icon: 'ri-checkbox-circle-line' };
  }

  getTypeMeta(type: CouponType): { label: string; class: string; icon: string } {
    switch (type) {
      case 'percentage_discount':
        return { label: 'Percentage OFF', class: 'bg-primary-transparent text-primary border border-primary-subtle', icon: 'ri-percent-line' };
      case 'fixed_discount':
        return { label: 'Fixed Discount', class: 'bg-info-transparent text-info border border-info-subtle', icon: 'ri-money-dollar-circle-line' };
      case 'wallet_credit':
        return { label: 'Wallet Points', class: 'bg-warning-transparent text-warning border border-warning-subtle', icon: 'ri-copper-coin-line' };
      case 'free_access':
        return { label: 'Free Access', class: 'bg-success-transparent text-success border border-success-subtle', icon: 'ri-gift-line' };
      default:
        return { label: type, class: 'bg-light text-muted border', icon: 'ri-coupon-3-line' };
    }
  }

  // ==========================================
  // 5. STATUS TOGGLE
  // ==========================================
  toggleStatus(coupon: Coupon): void {
    const targetStatus = !coupon.is_active;
    this.togglingCouponId = coupon.id;

    this.couponService.toggleCouponStatus(coupon.id, targetStatus).subscribe({
      next: (res) => {
        this.togglingCouponId = null;
        if (res.success) {
          coupon.is_active = targetStatus;
          this.toastr.success(res.message || `Coupon ${targetStatus ? 'activated' : 'deactivated'} successfully.`, 'Status Updated');
          this.loadStatistics();
          this.applyLocalValidityFilter();
        } else {
          this.toastr.error(res.message || 'Failed to toggle status.', 'Error');
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.togglingCouponId = null;
        console.error('Error updating status:', err);
        this.toastr.error(err?.error?.message || 'Failed to update coupon status.', 'Error');
        this.cdr.markForCheck();
      }
    });
  }

  // ==========================================
  // 6. CREATE & EDIT MODAL
  // ==========================================
  openAddCouponModal(): void {
    this.isEditMode = false;
    this.formId = undefined;
    this.formErrors = {};

    this.formCode = '';
    this.formTitle = '';
    this.formDescription = '';
    this.formType = 'percentage_discount';
    this.formDiscountValue = 20;
    this.formMinOrder = 0;
    this.formMaxDiscount = null;
    this.formWalletPoints = 100;
    this.formFreeAccessType = 'course';
    this.formFreeAccessItemId = null;
    this.formUsageLimit = null;
    this.formPerUserLimit = 1;

    // Default dates: From today to +30 days
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);

    this.formValidFrom = this.formatDateForInput(now);
    this.formValidUntil = this.formatDateForInput(nextMonth);
    this.formIsActive = true;
    this.formApplicability = 'all';
    this.formProductMappings = [];

    this.formPickerType = 'course';
    this.formPickerProductId = null;

    this.activeModalRef = this.modalService.open(this.couponFormModalRef, {
      size: 'lg',
      backdrop: 'static',
      centered: true
    });
  }

  openEditCouponModal(coupon: Coupon): void {
    this.isEditMode = true;
    this.formId = coupon.id;
    this.formErrors = {};

    this.formCode = coupon.code;
    this.formTitle = coupon.title;
    this.formDescription = coupon.description || '';
    this.formType = coupon.coupon_type;
    this.formDiscountValue = coupon.discount_value;
    this.formMinOrder = coupon.minimum_order_amount;
    this.formMaxDiscount = coupon.maximum_discount_amount ?? null;
    this.formWalletPoints = coupon.wallet_credit_points;
    this.formFreeAccessType = (coupon.free_access_type as ProductType) || 'course';
    this.formFreeAccessItemId = coupon.free_access_item_id || null;
    this.formUsageLimit = coupon.usage_limit ?? null;
    this.formPerUserLimit = coupon.per_user_limit || 1;

    this.formValidFrom = coupon.valid_from ? this.formatDateForInput(new Date(coupon.valid_from)) : '';
    this.formValidUntil = coupon.valid_until ? this.formatDateForInput(new Date(coupon.valid_until)) : '';
    this.formIsActive = !!coupon.is_active;

    const mappings = coupon.product_mappings || [];
    this.formApplicability = mappings.length > 0 ? 'specific' : 'all';
    this.formProductMappings = mappings.map(m => ({
      product_type: m.product_type,
      product_id: m.product_id,
      title: m.product_name || m.title || `${m.product_type} #${m.product_id}`,
      price: m.price
    }));

    this.formPickerType = 'course';
    this.formPickerProductId = null;

    this.activeModalRef = this.modalService.open(this.couponFormModalRef, {
      size: 'lg',
      backdrop: 'static',
      centered: true
    });
  }

  onCouponCodeInput(event: any): void {
    const rawValue = event.target.value || '';
    // Allow uppercase alphanumeric and hyphens/underscores
    const sanitized = rawValue.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    this.formCode = sanitized;
  }

  onFormTypeChange(): void {
    this.formErrors = {};
    if (this.formType === 'percentage_discount') {
      if (!this.formDiscountValue || this.formDiscountValue <= 0) this.formDiscountValue = 15;
    } else if (this.formType === 'fixed_discount') {
      if (!this.formDiscountValue || this.formDiscountValue <= 0) this.formDiscountValue = 100;
    } else if (this.formType === 'wallet_credit') {
      if (!this.formWalletPoints || this.formWalletPoints <= 0) this.formWalletPoints = 100;
    } else if (this.formType === 'free_access') {
      if (!this.formFreeAccessType) this.formFreeAccessType = 'course';
    }
  }

  getFilteredFormPickerProducts(): SelectableProduct[] {
    if (this.formPickerType === 'course') return this.coursesList;
    if (this.formPickerType === 'pdf') return this.pdfsList;
    if (this.formPickerType === 'audiobook') return this.audiosList;
    return [];
  }

  getFilteredFreeAccessProducts(): SelectableProduct[] {
    if (this.formFreeAccessType === 'course') return this.coursesList;
    if (this.formFreeAccessType === 'pdf') return this.pdfsList;
    if (this.formFreeAccessType === 'audiobook') return this.audiosList;
    return [];
  }

  addFormProductMapping(): void {
    if (!this.formPickerProductId) {
      this.toastr.warning('Please select a product to map.', 'Validation');
      return;
    }

    const exists = this.formProductMappings.some(
      m => m.product_type === this.formPickerType && Number(m.product_id) === Number(this.formPickerProductId)
    );

    if (exists) {
      this.toastr.info('This product is already added to the list.', 'Duplicate');
      return;
    }

    const productCatalog = this.getFilteredFormPickerProducts();
    const foundProduct = productCatalog.find(p => Number(p.id) === Number(this.formPickerProductId));

    this.formProductMappings.push({
      product_type: this.formPickerType,
      product_id: Number(this.formPickerProductId),
      title: foundProduct?.title || `${this.formPickerType} #${this.formPickerProductId}`,
      price: foundProduct?.price
    });

    this.formPickerProductId = null;
  }

  removeFormProductMapping(index: number): void {
    this.formProductMappings.splice(index, 1);
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.formCode || !this.formCode.trim()) {
      this.formErrors['code'] = 'Coupon code is required.';
    } else if (this.formCode.trim().length < 3) {
      this.formErrors['code'] = 'Coupon code must be at least 3 characters.';
    }

    if (!this.formTitle || !this.formTitle.trim()) {
      this.formErrors['title'] = 'Coupon title is required.';
    }

    if (!this.formType) {
      this.formErrors['coupon_type'] = 'Coupon type is required.';
    }

    // Type-specific validations
    if (this.formType === 'percentage_discount') {
      const discount = Number(this.formDiscountValue);
      if (isNaN(discount) || discount <= 0 || discount > 100) {
        this.formErrors['discount_value'] = 'Percentage discount must be between 1 and 100%.';
      }
      if (this.formMaxDiscount !== null && this.formMaxDiscount !== undefined) {
        const maxVal = Number(this.formMaxDiscount);
        if (isNaN(maxVal) || maxVal <= 0) {
          this.formErrors['maximum_discount_amount'] = 'Maximum discount cap must be greater than 0.';
        }
      }
    } else if (this.formType === 'fixed_discount') {
      const discount = Number(this.formDiscountValue);
      if (isNaN(discount) || discount <= 0) {
        this.formErrors['discount_value'] = 'Fixed discount amount must be greater than 0.';
      }
    } else if (this.formType === 'wallet_credit') {
      const points = Number(this.formWalletPoints);
      if (isNaN(points) || points <= 0) {
        this.formErrors['wallet_credit_points'] = 'Wallet credit points must be greater than 0.';
      }
    } else if (this.formType === 'free_access') {
      if (!this.formFreeAccessType) {
        this.formErrors['free_access_type'] = 'Please select a free access product type.';
      }
      if (!this.formFreeAccessItemId) {
        this.formErrors['free_access_item_id'] = 'Please select the target free access item.';
      }
    }

    // Min order validation
    if (this.formMinOrder !== null && this.formMinOrder !== undefined) {
      const minOrder = Number(this.formMinOrder);
      if (isNaN(minOrder) || minOrder < 0) {
        this.formErrors['minimum_order_amount'] = 'Minimum order amount cannot be negative.';
      }
    }

    // Usage limits
    if (this.formUsageLimit !== null && this.formUsageLimit !== undefined) {
      const limit = Number(this.formUsageLimit);
      if (isNaN(limit) || limit < 1) {
        this.formErrors['usage_limit'] = 'Global usage limit must be at least 1.';
      }
    }

    if (this.formPerUserLimit !== null && this.formPerUserLimit !== undefined) {
      const perUser = Number(this.formPerUserLimit);
      if (isNaN(perUser) || perUser < 1) {
        this.formErrors['per_user_limit'] = 'Per-user limit must be at least 1.';
      }
    }

    // Dates validation
    if (this.formValidFrom && this.formValidUntil) {
      const from = new Date(this.formValidFrom);
      const until = new Date(this.formValidUntil);
      if (until < from) {
        this.formErrors['valid_until'] = 'Valid until date cannot be earlier than valid from date.';
      }
    }

    return Object.keys(this.formErrors).length === 0;
  }

  submitCouponForm(): void {
    if (!this.validateForm()) {
      this.toastr.warning('Please resolve highlighted form errors.', 'Validation Error');
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      code: this.formCode.trim().toUpperCase(),
      title: this.formTitle.trim(),
      description: this.formDescription?.trim() || null,
      coupon_type: this.formType,
      minimum_order_amount: this.formMinOrder !== null && this.formMinOrder !== undefined ? Number(this.formMinOrder) : 0,
      usage_limit: this.formUsageLimit !== null && this.formUsageLimit !== undefined ? Number(this.formUsageLimit) : null,
      per_user_limit: Number(this.formPerUserLimit) || 1,
      valid_from: this.formValidFrom ? this.convertLocalToISO(this.formValidFrom) : null,
      valid_until: this.formValidUntil ? this.convertLocalToISO(this.formValidUntil) : null,
      is_active: this.formIsActive ? 1 : 0
    };

    if (this.formType === 'percentage_discount') {
      payload.discount_value = Number(this.formDiscountValue) || 0;
      payload.maximum_discount_amount = this.formMaxDiscount !== null && this.formMaxDiscount !== undefined ? Number(this.formMaxDiscount) : null;
      payload.wallet_credit_points = 0;
      payload.free_access_type = null;
      payload.free_access_item_id = null;
    } else if (this.formType === 'fixed_discount') {
      payload.discount_value = Number(this.formDiscountValue) || 0;
      payload.maximum_discount_amount = null;
      payload.wallet_credit_points = 0;
      payload.free_access_type = null;
      payload.free_access_item_id = null;
    } else if (this.formType === 'wallet_credit') {
      payload.discount_value = 0;
      payload.maximum_discount_amount = null;
      payload.wallet_credit_points = Number(this.formWalletPoints) || 0;
      payload.free_access_type = null;
      payload.free_access_item_id = null;
    } else if (this.formType === 'free_access') {
      payload.discount_value = 0;
      payload.maximum_discount_amount = null;
      payload.wallet_credit_points = 0;
      payload.free_access_type = this.formFreeAccessType;
      payload.free_access_item_id = Number(this.formFreeAccessItemId);
    }

    if (this.formApplicability === 'specific' && this.formProductMappings.length > 0) {
      payload.product_mappings = this.formProductMappings.map(m => ({
        product_type: m.product_type,
        product_id: m.product_id
      }));
    } else {
      payload.product_mappings = [];
    }

    if (this.isEditMode && this.formId) {
      this.couponService.updateCoupon(this.formId, payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.toastr.success(res.message || 'Coupon updated successfully.', 'Success');
            this.activeModalRef?.close();
            this.loadCoupons();
            this.loadStatistics();
          } else {
            this.toastr.error(res.message || 'Failed to update coupon.', 'Error');
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Update coupon error:', err);
          this.toastr.error(err?.error?.message || 'Failed to update coupon.', 'Error');
          this.cdr.markForCheck();
        }
      });
    } else {
      this.couponService.createCoupon(payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.toastr.success(res.message || 'Coupon created successfully.', 'Success');
            this.activeModalRef?.close();
            this.loadCoupons();
            this.loadStatistics();
          } else {
            this.toastr.error(res.message || 'Failed to create coupon.', 'Error');
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Create coupon error:', err);
          this.toastr.error(err?.error?.message || 'Failed to create coupon.', 'Error');
          this.cdr.markForCheck();
        }
      });
    }
  }

  // ==========================================
  // 7. VIEW COUPON DETAILS MODAL
  // ==========================================
  openViewModal(coupon: Coupon): void {
    this.selectedCoupon = coupon;
    this.viewPickerType = 'course';
    this.viewPickerProductId = null;

    // Refresh details from backend to ensure product mappings are up to date
    this.couponService.getCoupon(coupon.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectedCoupon = this.normalizeCoupon(res.data);
          this.resolveFreeAccessItemName(this.selectedCoupon);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Failed to refresh coupon details:', err);
      }
    });

    this.resolveFreeAccessItemName(this.selectedCoupon);

    this.activeModalRef = this.modalService.open(this.viewCouponModalRef, {
      size: 'lg',
      centered: true
    });
  }

  private resolveFreeAccessItemName(coupon: Coupon | null): void {
    if (!coupon || coupon.coupon_type !== 'free_access' || !coupon.free_access_item_id) return;
    const prod = this.allProducts.find(
      p => p.type === coupon.free_access_type && Number(p.id) === Number(coupon.free_access_item_id)
    );
    if (prod) {
      coupon.free_access_item_name = prod.title;
    }
  }

  getFilteredViewPickerProducts(): SelectableProduct[] {
    if (this.viewPickerType === 'course') return this.coursesList;
    if (this.viewPickerType === 'pdf') return this.pdfsList;
    if (this.viewPickerType === 'audiobook') return this.audiosList;
    return [];
  }

  addViewProductMapping(): void {
    if (!this.selectedCoupon || !this.viewPickerProductId) {
      this.toastr.warning('Please select a product to map.', 'Validation');
      return;
    }

    const payload = {
      product_type: this.viewPickerType,
      product_id: Number(this.viewPickerProductId)
    };

    this.isAddingViewMapping = true;

    this.couponService.addCouponProduct(this.selectedCoupon.id, payload).subscribe({
      next: (res) => {
        this.isAddingViewMapping = false;
        this.viewPickerProductId = null;
        if (res.success && this.selectedCoupon) {
          this.selectedCoupon.product_mappings = res.data?.all_products || [];
          this.toastr.success('Product mapping added successfully.', 'Success');
          // Update in master list
          const found = this.coupons.find(c => c.id === this.selectedCoupon?.id);
          if (found) found.product_mappings = this.selectedCoupon.product_mappings;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isAddingViewMapping = false;
        console.error('Add mapping error:', err);
        this.toastr.error(err?.error?.message || 'Failed to add product mapping.', 'Error');
        this.cdr.markForCheck();
      }
    });
  }

  removeViewProductMapping(mapping: CouponProductMapping): void {
    if (!this.selectedCoupon) return;
    this.removingMappingId = mapping.id;

    this.couponService.removeCouponProduct(this.selectedCoupon.id, mapping.id).subscribe({
      next: (res) => {
        this.removingMappingId = null;
        if (res.success && this.selectedCoupon) {
          this.selectedCoupon.product_mappings = res.data?.all_products || [];
          this.toastr.success('Product mapping removed.', 'Success');
          const found = this.coupons.find(c => c.id === this.selectedCoupon?.id);
          if (found) found.product_mappings = this.selectedCoupon.product_mappings;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.removingMappingId = null;
        console.error('Remove mapping error:', err);
        this.toastr.error(err?.error?.message || 'Failed to remove mapping.', 'Error');
        this.cdr.markForCheck();
      }
    });
  }

  // ==========================================
  // 8. USAGE HISTORY MODAL
  // ==========================================
  openUsageModal(coupon: Coupon): void {
    this.usageCoupon = coupon;
    this.usagePage = 1;
    this.usageList = [];
    this.isLoadingUsage = true;

    this.activeModalRef = this.modalService.open(this.usageHistoryModalRef, {
      size: 'lg',
      centered: true
    });

    this.loadUsageHistory(coupon.id);
  }

  loadUsageHistory(couponId: number): void {
    this.isLoadingUsage = true;

    this.couponService.getCouponUsage(couponId, { page: this.usagePage, limit: this.usagePageSize }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.usageList = res.data.usages || [];
          if (res.data.pagination) {
            this.usageTotalCount = Number(res.data.pagination.total || this.usageList.length);
            this.usageTotalPages = Number(res.data.pagination.total_pages || 1);
            this.usagePage = Number(res.data.pagination.page || this.usagePage);
          } else {
            this.usageTotalCount = this.usageList.length;
            this.usageTotalPages = Math.ceil(this.usageTotalCount / this.usagePageSize) || 1;
          }
        }
        this.isLoadingUsage = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Usage history error:', err);
        this.isLoadingUsage = false;
        this.toastr.error(err?.error?.message || 'Failed to fetch usage history.', 'Error');
        this.cdr.markForCheck();
      }
    });
  }

  onUsagePageChange(page: number): void {
    if (this.usageCoupon?.id && page !== this.usagePage && page >= 1 && page <= this.usageTotalPages) {
      this.usagePage = page;
      this.loadUsageHistory(this.usageCoupon.id);
    }
  }

  // ==========================================
  // 9. DELETE MODAL
  // ==========================================
  openDeleteModal(coupon: Coupon): void {
    this.deleteTargetCoupon = coupon;
    this.activeModalRef = this.modalService.open(this.deleteConfirmModalRef, {
      centered: true
    });
  }

  confirmDelete(): void {
    if (!this.deleteTargetCoupon) return;
    this.isDeleting = true;

    this.couponService.deleteCoupon(this.deleteTargetCoupon.id).subscribe({
      next: (res) => {
        this.isDeleting = false;
        if (res.success) {
          this.toastr.success(res.message || `Coupon '${this.deleteTargetCoupon?.code}' deleted successfully.`, 'Deleted');
          this.activeModalRef?.close();
          this.loadCoupons();
          this.loadStatistics();
        } else {
          this.toastr.error(res.message || 'Failed to delete coupon.', 'Error');
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Delete coupon error:', err);
        // Show exact backend rejection error message
        this.toastr.error(err?.error?.message || 'Failed to delete coupon. It might be referenced by past orders.', 'Delete Failed');
        this.cdr.markForCheck();
      }
    });
  }

  // ==========================================
  // 10. UTILITY HELPERS
  // ==========================================
  copyToClipboard(text: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.toastr.success(`Copied '${text}' to clipboard!`, 'Copied');
      }).catch(() => {
        this.toastr.info(text, 'Coupon Code');
      });
    }
  }

  private formatDateForInput(date: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  }

  private convertLocalToISO(localStr: string): string {
    const d = new Date(localStr);
    return !isNaN(d.getTime()) ? d.toISOString() : localStr;
  }
}
