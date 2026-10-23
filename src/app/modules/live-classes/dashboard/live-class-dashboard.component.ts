import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LiveClassService, LiveClassDashboardStats, LiveClass } from '../live-class.service';

@Component({
  selector: 'app-live-class-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './live-class-dashboard.component.html',
  styleUrl: './live-class-dashboard.component.scss'
})
export class LiveClassDashboardComponent implements OnInit {
  isLoading: boolean = true;
  stats: LiveClassDashboardStats = {
    totalClasses: 0,
    draftClasses: 0,
    upcomingClasses: 0,
    liveClasses: 0,
    completedClasses: 0,
    cancelledClasses: 0,
    totalBookings: 0,
    totalRevenue: 0,
    upcomingList: [],
    liveList: []
  };

  constructor(
    private liveClassService: LiveClassService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.liveClassService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading live class dashboard stats:', err);
        this.toastr.error('Failed to load dashboard metrics. Please retry.', 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getThumbnail(path: string | null | undefined): string {
    if (!path) return 'assets/images/media/media-48.jpg';
    return this.liveClassService.getAssetUrl(path);
  }

  getMentorPhoto(photo: string | null | undefined): string {
    if (!photo) return 'assets/images/faces/9.jpg';
    return this.liveClassService.getAssetUrl(photo);
  }

  isDiscounted(item: LiveClass): boolean {
    const discounted = item.pricing?.discounted_fees || 0;
    const regular = item.pricing?.fees || 0;
    return discounted > 0 && discounted < regular;
  }

  getEffectiveFee(item: LiveClass): number {
    return item.pricing?.effective_fee ?? (item.pricing?.discounted_fees || item.pricing?.fees || 0);
  }

  isFree(item: LiveClass): boolean {
    return !!(item.pricing?.is_free || this.getEffectiveFee(item) === 0);
  }

  getEnrolledCount(item: LiveClass): number {
    return item.capacity?.enrolled_count ?? item['enrolled_count'] ?? 0;
  }

  getMaxStudents(item: LiveClass): number {
    return item.capacity?.max_students ?? item['max_students'] ?? 10;
  }

  viewClass(id: number): void {
    this.router.navigate(['/live-classes/details', id]);
  }

  manageSession(id: number): void {
    this.router.navigate(['/live-classes/details', id], { queryParams: { tab: 'session' } });
  }

  createClass(): void {
    this.router.navigate(['/live-classes/create']);
  }

  viewAllClasses(filterStatus?: string): void {
    if (filterStatus) {
      this.router.navigate(['/live-classes/list'], { queryParams: { status: filterStatus } });
    } else {
      this.router.navigate(['/live-classes/list']);
    }
  }
}
