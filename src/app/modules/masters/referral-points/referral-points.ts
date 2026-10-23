import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { AuthService } from '../../../shared/services/auth.service';
import {
  ReferralPointsService,
  ReferralPointsConfig,
  CreateReferralPointsDto,
  UpdateReferralPointsDto
} from './referral-points.service';

@Component({
  selector: 'app-referral-points',
  standalone: true,
  imports: [CommonModule, FormsModule, SpkReusableTables],
  templateUrl: './referral-points.html',
  styleUrl: './referral-points.scss'
})
export class ReferralPoints implements OnInit {
  configs: ReferralPointsConfig[] = [];
  filteredConfigs: ReferralPointsConfig[] = [];
  activeConfig: ReferralPointsConfig | null = null;
  selectedConfig: ReferralPointsConfig | null = null;

  isLoading: boolean = false;
  isSubmitting: boolean = false;

  // Search state
  searchText: string = '';

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;

  // Add Form state
  addPoints: number | null = null;
  addStatus: 'active' | 'inactive' = 'active';

  // Edit Form state
  editPoints: number | null = null;
  editStatus: 'active' | 'inactive' = 'active';

  constructor(
    private referralService: ReferralPointsService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken() || localStorage.getItem('token');
    if (!token) {
      this.toastr.warning('Please log in first.', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.loadActiveConfig();
    this.loadConfigs();
  }

  loadActiveConfig(): void {
    this.referralService.getActiveReferralPoints().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activeConfig = res.data;
        } else {
          this.activeConfig = null;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        // 404 is normal if no configuration is active yet
        if (err.status !== 404) {
          console.error('Error fetching active referral points:', err);
        }
        this.activeConfig = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadConfigs(): void {
    this.isLoading = true;
    this.referralService.getReferralPoints({
      page: this.currentPage,
      limit: this.pageSize
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.configs = res.data;
          if (res.pagination) {
            this.totalItems = res.pagination.total_items;
            this.totalPages = res.pagination.total_pages;
            this.currentPage = res.pagination.page;
          } else {
            this.totalItems = res.data.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
          }
          this.applyFilter();
        } else {
          this.configs = [];
          this.filteredConfigs = [];
          this.totalItems = 0;
          this.totalPages = 1;
          this.toastr.error(res.message || 'Failed to load referral points.', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading referral points configurations:', err);
        this.toastr.error(err.error?.message || 'Server error while fetching referral points.', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    let result = [...this.configs];

    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase().trim();
      result = result.filter(c =>
        c.points.toString().includes(query) ||
        c.id.toString().includes(query) ||
        c.status.toLowerCase().includes(query)
      );
    }

    this.filteredConfigs = result;
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  // Modal Handlers
  openAddModal(content: any): void {
    this.addPoints = null;
    this.addStatus = 'active';
    this.isSubmitting = false;

    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  createReferralPoints(modal: any): void {
    if (this.addPoints === null || this.addPoints === undefined || isNaN(this.addPoints)) {
      this.toastr.error('Points are required.', 'Validation Error');
      return;
    }

    if (this.addPoints <= 0) {
      this.toastr.error('Points must be greater than 0.', 'Validation Error');
      return;
    }

    const payload: CreateReferralPointsDto = {
      points: Number(this.addPoints),
      status: this.addStatus
    };

    this.isSubmitting = true;
    this.referralService.createReferralPoints(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success(res.message || 'Referral points configuration created successfully.', 'Success');
          modal.close();
          this.loadAllData();
        } else {
          this.toastr.error(res.message || 'Failed to create configuration.', 'Error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creating referral points configuration:', err);
        this.toastr.error(err.error?.message || 'Server error while creating configuration.', 'Error');
      }
    });
  }

  openEditModal(config: ReferralPointsConfig, content: any): void {
    this.selectedConfig = config;
    this.editPoints = config.points;
    this.editStatus = config.status;
    this.isSubmitting = false;

    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  updateReferralPoints(modal: any): void {
    if (!this.selectedConfig) return;

    if (this.editPoints === null || this.editPoints === undefined || isNaN(this.editPoints)) {
      this.toastr.error('Points are required.', 'Validation Error');
      return;
    }

    if (this.editPoints <= 0) {
      this.toastr.error('Points must be greater than 0.', 'Validation Error');
      return;
    }

    const payload: UpdateReferralPointsDto = {
      points: Number(this.editPoints),
      status: this.editStatus
    };

    this.isSubmitting = true;
    this.referralService.updateReferralPoints(this.selectedConfig.id, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success(res.message || 'Referral points configuration updated successfully.', 'Success');
          modal.close();
          this.loadAllData();
        } else {
          this.toastr.error(res.message || 'Failed to update configuration.', 'Error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error updating referral points configuration:', err);
        this.toastr.error(err.error?.message || 'Server error while updating configuration.', 'Error');
      }
    });
  }

  openViewModal(config: ReferralPointsConfig, content: any): void {
    this.selectedConfig = config;
    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  openDeleteModal(config: ReferralPointsConfig, content: any): void {
    this.selectedConfig = config;
    this.modalService.open(content, {
      centered: true,
      size: 'md'
    });
  }

  deleteReferralPoints(modal: any): void {
    if (!this.selectedConfig?.id) return;
    const id = this.selectedConfig.id;
    this.isSubmitting = true;
    this.referralService.deleteReferralPoints(id).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success(res.message || 'Referral points configuration deleted successfully.', 'Success');
          modal.close();
          this.loadAllData();
        } else {
          this.toastr.error(res.message || 'Failed to delete configuration.', 'Error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error deleting referral points configuration:', err);
        this.toastr.error(err.error?.message || 'Server error while deleting configuration.', 'Error');
      }
    });
  }

  toggleStatus(config: ReferralPointsConfig): void {
    const targetStatus: 'active' | 'inactive' = config.status === 'active' ? 'inactive' : 'active';

    this.referralService.toggleStatus(config.id, targetStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message || `Referral points status updated to ${targetStatus}.`, 'Success');
          this.loadAllData();
        } else {
          this.toastr.error(res.message || 'Failed to update status.', 'Error');
          this.loadAllData();
        }
      },
      error: (err) => {
        console.error('Error toggling status:', err);
        this.toastr.error(err.error?.message || 'Server error while updating status.', 'Error');
        this.loadAllData();
      }
    });
  }

  quickActivate(config: ReferralPointsConfig): void {
    if (config.status === 'active') return;

    this.referralService.toggleStatus(config.id, 'active').subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Configuration #${config.id} (${config.points} pts) is now active!`, 'Activated');
          this.loadAllData();
        } else {
          this.toastr.error(res.message || 'Failed to activate configuration.', 'Error');
        }
      },
      error: (err) => {
        console.error('Error activating configuration:', err);
        this.toastr.error(err.error?.message || 'Server error while activating configuration.', 'Error');
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadConfigs();
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadConfigs();
  }
}
