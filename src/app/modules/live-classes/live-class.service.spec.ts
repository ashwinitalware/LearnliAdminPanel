import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LiveClassService } from './live-class.service';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

describe('LiveClassService', () => {
  let service: LiveClassService;
  let httpMock: HttpTestingController;

  const mockAuthService = {
    getToken: () => 'mock-jwt-admin-token'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        LiveClassService
      ]
    });
    service = TestBed.inject(LiveClassService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch live classes with pagination and filters', () => {
    const mockResponse = {
      success: true,
      message: 'Live classes retrieved successfully.',
      data: [
        {
          id: 1,
          title: 'Physics Masterclass',
          subject: 'Physics',
          class_type: 'group' as const,
          class_date: '2026-11-01',
          start_time: '10:00:00',
          end_time: '11:00:00',
          duration: 60,
          timezone: 'Asia/Kolkata',
          status: 'published' as const,
          pricing: {
            use_mentor_default: false,
            fees: 500,
            discounted_fees: 300,
            effective_fee: 300,
            is_free: false
          },
          capacity: {
            max_students: 15,
            enrolled_count: 5,
            available_seats: 10,
            is_full: false
          }
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };

    service.getLiveClasses({ page: 1, limit: 10 }).subscribe(res => {
      expect(res.success).toBeTrue();
      expect(res.data.length).toBe(1);
      expect(res.data[0].title).toBe('Physics Masterclass');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/live-classes?page=1&limit=10`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-admin-token');
    req.flush(mockResponse);
  });

  it('should provision a Webinar.gg room', () => {
    const mockResponse = {
      success: true,
      message: 'Webinar.gg room provisioned successfully.',
      data: {
        live_class_id: 1,
        provider: 'webinar.gg',
        provider_session_id: 'webinar_123',
        session_status: 'scheduled' as const,
        room_url: 'https://webinar.gg/room/123'
      }
    };

    service.provisionSession(1).subscribe(res => {
      expect(res.success).toBeTrue();
      expect(res.data.provider_session_id).toBe('webinar_123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/live-classes/1/session/create`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should start a live session', () => {
    const mockResponse = {
      success: true,
      message: 'Live session started successfully.',
      data: {
        live_class_id: 1,
        session_status: 'live' as const,
        class_status: 'ongoing' as const,
        started_at: new Date().toISOString()
      }
    };

    service.startSession(1).subscribe(res => {
      expect(res.success).toBeTrue();
      expect(res.data.session_status).toBe('live');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/live-classes/1/session/start`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should end a live session and close attendance intervals', () => {
    const mockResponse = {
      success: true,
      message: 'Live session ended successfully.',
      data: {
        live_class_id: 1,
        session_status: 'ended' as const,
        class_status: 'completed' as const,
        ended_at: new Date().toISOString(),
        closed_attendance_intervals: 3
      }
    };

    service.endSession(1).subscribe(res => {
      expect(res.success).toBeTrue();
      expect(res.data.session_status).toBe('ended');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/live-classes/1/session/end`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
