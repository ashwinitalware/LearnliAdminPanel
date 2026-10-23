import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';
import { MentorBookings, MentorBooking } from './mentor-bookings';
import { environment } from '../../../../environments/environment';

describe('MentorBookings Component - Phase 7B Test Suite', () => {
  let component: MentorBookings;
  let fixture: ComponentFixture<MentorBookings>;
  let httpTestingController: HttpTestingController;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockZoomBooking: MentorBooking = {
    id: 101,
    booking_number: 'MB-2026-001',
    status: 'confirmed',
    booking_date: '2026-10-15',
    start_time: '10:00',
    end_time: '11:00',
    topic: 'System Architecture & Scaling',
    student_notes: 'Need guidance on microservices decomposition.',
    amount: '1500.00',
    payment_status: 'paid',
    payment_method: 'Razorpay',
    razorpay_payment_id: 'pay_MNT987654321',
    meeting_provider: 'zoom',
    meeting_status: 'scheduled',
    zoom_meeting_id: '98765432101',
    zoom_meeting_password: 'PassWord123',
    zoom_join_url: 'https://zoom.us/j/98765432101?pwd=mock',
    zoom_start_url: 'https://zoom.us/s/98765432101?zak=mock',
    zoom_host_email: 'mentor@learnli.online',
    zoom_created_at: '2026-10-01T08:00:00Z',
    duration_minutes: 60,
    student: {
      id: 1,
      full_name: 'John Student',
      mobile: '+91 9876543210',
      email: 'john@example.com'
    },
    mentor: {
      id: 5,
      full_name: 'Dr. Jane Mentor',
      qualification: 'Principal Architect',
      expert_in: 'Distributed Systems'
    }
  };

  const mockGoogleMeetBooking: MentorBooking = {
    id: 102,
    booking_number: 'MB-2026-002',
    status: 'confirmed',
    booking_date: '2026-10-16',
    start_time: '14:00',
    end_time: '15:00',
    topic: 'Legacy Architecture',
    google_meet_url: 'https://meet.google.com/abc-defg-hij',
    meeting_notes: 'Please join 5 minutes early.',
    amount: '0.00',
    payment_status: 'free',
    meeting_provider: 'google_meet'
  };

  const mockPendingZoomBooking: MentorBooking = {
    id: 103,
    booking_number: 'MB-2026-003',
    status: 'confirmed',
    booking_date: '2026-10-17',
    start_time: '16:00',
    end_time: '17:00',
    amount: '500.00',
    payment_status: 'paid',
    meeting_provider: 'zoom',
    meeting_status: 'pending'
  };

  beforeEach(async () => {
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    await TestBed.configureTestingModule({
      imports: [MentorBookings],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ToastrService, useValue: toastrSpy },
        { provide: AuthService, useValue: { getToken: () => 'mock-token-xyz' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MentorBookings);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
  });

  // --- Step 2: All Bookings & Filters ---
  it('should switch between slot_wise and table views', () => {
    spyOn(component, 'loadBookings');
    spyOn(component, 'loadKpiCounts');
    expect(component.activeViewMode).toBe('slot_wise');
    component.switchViewMode('table');
    expect(component.activeViewMode).toBe('table');
    expect(component.loadBookings).toHaveBeenCalled();
    component.switchViewMode('slot_wise');
    expect(component.activeViewMode).toBe('slot_wise');
  });

  // --- Step 3: Zoom Testing ---
  it('should correctly identify Zoom booking and extract Zoom details', () => {
    expect(component.isZoomBooking(mockZoomBooking)).toBeTrue();
    expect(component.isGoogleMeetBooking(mockZoomBooking)).toBeFalse();
    expect(component.getZoomStatus(mockZoomBooking)).toBe('scheduled');
    expect(component.getZoomMeetingId(mockZoomBooking)).toBe('98765432101');
    expect(component.getZoomPasscode(mockZoomBooking)).toBe('PassWord123');
    expect(component.getZoomJoinUrl(mockZoomBooking)).toBe('https://zoom.us/j/98765432101?pwd=mock');
    expect(component.getZoomStartUrl(mockZoomBooking)).toBe('https://zoom.us/s/98765432101?zak=mock');
    expect(component.getZoomHostEmail(mockZoomBooking)).toBe('mentor@learnli.online');
    expect(component.getZoomDuration(mockZoomBooking)).toBe(60);
  });

  // --- Step 4: Zoom Failure & Sync Testing ---
  it('should prevent double click when syncing Zoom', () => {
    component.isSyncingZoom[101] = true;
    component.syncZoom(mockZoomBooking);
    // Should not issue HTTP request since already syncing
    httpTestingController.expectNone(`${environment.apiUrl}/admin/mentor-bookings/101/sync-zoom`);
    expect(component.isSyncingZoom[101]).toBeTrue();
  });

  it('should trigger POST sync-zoom and update booking on success', () => {
    component.selectedBooking = { ...mockPendingZoomBooking };
    component.syncZoom(mockPendingZoomBooking);

    expect(component.isSyncingZoom[103]).toBeTrue();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/admin/mentor-bookings/103/sync-zoom`);
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      message: 'Zoom meeting synchronized successfully.',
      data: {
        zoom: {
          meeting_provider: 'zoom',
          meeting_status: 'scheduled',
          zoom_meeting_id: '999888777',
          zoom_meeting_password: 'Pass123Password',
          zoom_join_url: 'https://zoom.us/j/999888777',
          zoom_start_url: 'https://zoom.us/s/999888777'
        }
      }
    });

    const detailsReq = httpTestingController.expectOne(`${environment.apiUrl}/admin/mentor-bookings/103`);
    expect(detailsReq.request.method).toBe('GET');
    detailsReq.flush({ success: true, data: mockPendingZoomBooking });

    expect(component.isSyncingZoom[103]).toBeFalse();
    expect(toastrSpy.success).toHaveBeenCalledWith('Zoom meeting synchronized successfully.', 'Zoom Synchronized');
  });

  // --- Step 5: Payment Testing ---
  it('should correctly format payment status and badge classes', () => {
    expect(component.getBookingPaymentStatus(mockZoomBooking)).toBe('PAID');
    expect(component.getPaymentBadgeClass('paid')).toBe('badge-payment-paid');

    expect(component.getBookingPaymentStatus(mockGoogleMeetBooking)).toBe('FREE');
    expect(component.getPaymentBadgeClass('free')).toBe('badge-payment-free');

    expect(component.getPaymentBadgeClass('pending')).toBe('badge-payment-pending');
    expect(component.getPaymentBadgeClass('failed')).toBe('badge-payment-failed');
    expect(component.getPaymentBadgeClass('refunded')).toBe('badge-payment-refunded');
  });

  // --- Step 6: Legacy Google Meet Regression ---
  it('should correctly handle legacy Google Meet bookings without showing Zoom state', () => {
    expect(component.isGoogleMeetBooking(mockGoogleMeetBooking)).toBeTrue();
    expect(component.isZoomBooking(mockGoogleMeetBooking)).toBeFalse();
    expect(mockGoogleMeetBooking.google_meet_url).toBe('https://meet.google.com/abc-defg-hij');
  });

  // --- Step 8: Copy to Clipboard Helpers ---
  it('should trigger toastr warning on empty copy actions', () => {
    component.copyMeetingId(null);
    expect(toastrSpy.warning).toHaveBeenCalledWith('No Meeting ID available to copy.', 'Warning');
  });

  // --- Step 9: Webinar.gg Integration Unit Tests ---
  const mockWebinarBooking: MentorBooking = {
    id: 201,
    booking_number: 'MB-2026-WGG-01',
    status: 'confirmed',
    booking_date: '2026-10-20',
    start_time: '11:00',
    end_time: '12:00',
    topic: 'Full-Stack Angular & Node Integration',
    meeting_provider: 'webinar_gg',
    webinar_id: 'wgg_live_session_998877',
    webinar_status: 'live',
    room_url: 'https://webinar.gg/room/wgg_live_session_998877',
    recording_url: 'https://storage.webinar.gg/recordings/wgg_live_session_998877.mp4',
    webinar: {
      webinar_id: 'wgg_live_session_998877',
      webinar_title: 'Full-Stack Angular & Node Integration',
      webinar_status: 'live',
      scheduled_at: '2026-10-20T11:00:00Z',
      duration_minutes: 60,
      timezone: 'Asia/Kolkata',
      room_url: 'https://webinar.gg/room/wgg_live_session_998877',
      recording_url: 'https://storage.webinar.gg/recordings/wgg_live_session_998877.mp4'
    }
  };

  it('should correctly identify Webinar.gg booking and return live status and badge', () => {
    expect(component.isWebinarBooking(mockWebinarBooking)).toBeTrue();
    expect(component.getWebinarId(mockWebinarBooking)).toBe('wgg_live_session_998877');
    expect(component.getWebinarStatus(mockWebinarBooking)).toBe('live');
    expect(component.getWebinarBadgeClass('live')).toBe('webinar-badge-live');
    expect(component.getWebinarBadgeClass('scheduled')).toBe('webinar-badge-scheduled');
    expect(component.getWebinarBadgeClass('ended')).toBe('webinar-badge-ended');
    expect(component.getRoomUrl(mockWebinarBooking)).toBe('https://webinar.gg/room/wgg_live_session_998877');
    expect(component.hasRecording(mockWebinarBooking)).toBeTrue();
    expect(component.getRecordingUrl(mockWebinarBooking)).toBe('https://storage.webinar.gg/recordings/wgg_live_session_998877.mp4');
  });

  it('should switch to webhooks view mode and support webhook retry', () => {
    spyOn(component, 'loadWebhookEvents');
    spyOn(component, 'loadBookings');
    component.switchViewMode('webhooks');
    expect(component.activeViewMode).toBe('webhooks');
    expect(component.loadWebhookEvents).toHaveBeenCalled();

    const mockEvent = {
      id: 55,
      event_id: 'evt_wgg_12345',
      event_type: 'webinar.started',
      webinar_id: 'wgg_live_session_998877',
      processed_status: 'failed',
      error_message: 'Webhook delivery timeout'
    };

    component.retryWebhookEvent(mockEvent);
    expect(component.isRetryingWebhook[55]).toBeTrue();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/webinar/webhook/retry/55`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'Webhook event #55 reprocessed successfully!' });

    expect(component.isRetryingWebhook[55]).toBeFalse();
    expect(toastrSpy.success).toHaveBeenCalledWith('Webhook event #55 reprocessed successfully!', 'Webhook Reprocessed');
  });
});

