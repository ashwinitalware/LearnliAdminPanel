import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';

export interface MentorTimeSlot {
  id?: number;
  mentor_id?: number;
  day_of_week: string;
  day?: string;
  start_time: string;
  end_time: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-add-mentor',
  standalone: true,
  imports: [SpkReusableTables, FormsModule, DatePipe, CommonModule],
  templateUrl: './add-mentor.html',
  styleUrl: './add-mentor.scss'
})
export class AddMentor implements OnInit {
  mentors: any[] = [];
  subjects: any[] = [];
  selectedMentor: any = null;

  // Days list in standard week order
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Add Form Fields
  fullName: string = '';
  qualification: string = '';
  mobileNumber: string = '';
  email: string = '';
  address: string = '';
  aboutUs: string = '';
  experience: string = '';
  selectedSubjects: string[] = [];
  photoFile: File | null = null;
  photoFileName: string = '';
  
  // Add Form Time Slots
  timeSlots: MentorTimeSlot[] = [];
  selectedSlotDays: string[] = ['Monday'];
  slotStartTime: string = '09:00';
  slotEndTime: string = '11:00';

  // Edit Form Fields
  editFullName: string = '';
  editQualification: string = '';
  editMobileNumber: string = '';
  editEmail: string = '';
  editAddress: string = '';
  editAboutUs: string = '';
  editExperience: string = '';
  editSelectedSubjects: string[] = [];
  editPhotoFile: File | null = null;
  editPhotoFileName: string = '';

  // Edit Form Time Slots
  editTimeSlots: MentorTimeSlot[] = [];
  editSelectedSlotDays: string[] = [];
  editSlotStartTime: string = '09:00';
  editSlotEndTime: string = '11:00';

  // Dedicated Slot Management Modal
  activeSlotMentor: any = null;
  manageSlotsList: MentorTimeSlot[] = [];
  manageSelectedDays: string[] = [];
  manageStartTime: string = '09:00';
  manageEndTime: string = '11:00';
  manageFilterDay: string = 'All';
  isLoadingSlots: boolean = false;

  // Dedicated Mentor Slot Bookings Explorer Modal
  activeBookingMentor: any = null;
  activeMentorSlotBookingsData: any = null;
  isLoadingMentorSlotBookings: boolean = false;

  // Search/Filter Header Bindings
  searchText: string = '';
  filteredMentors: any[] = [];

  private apiUrl = `${environment.apiUrl}/mentor`;
  private mentorBookingsAdminUrl = `${environment.apiUrl}/mentor-bookings/admin`;
  private subjectsApiUrl = `${environment.apiUrl}/subject`;

  constructor(
    private modalService: NgbModal,
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastr.warning('Please log in first.', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadSubjects();
    this.loadMentors();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadSubjects(): void {
    this.http.get<any>(this.subjectsApiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.subjects = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
      }
    });
  }

  loadMentors(): void {
    this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.mentors = (res.data || []).map((m: any) => {
            let slots = m.time_slots;
            if (typeof slots === 'string') {
              try {
                slots = JSON.parse(slots);
              } catch (e) {
                slots = [];
              }
            }
            m.time_slots = Array.isArray(slots) ? slots : [];
            return m;
          });
          this.applyFilter();
        }
      },
      error: (err) => {
        console.error('Error loading mentors:', err);
        this.toastr.error('Failed to load mentors list.', 'Error');
      }
    });
  }

  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredMentors = [...this.mentors];
      this.cdr.detectChanges();
      return;
    }
    const query = this.searchText.toLowerCase().trim();
    this.filteredMentors = this.mentors.filter(mentor => 
      (mentor.full_name && mentor.full_name.toLowerCase().includes(query)) ||
      (mentor.email && mentor.email.toLowerCase().includes(query)) ||
      (mentor.mobile_number && mentor.mobile_number.toLowerCase().includes(query)) ||
      (mentor.qualification && mentor.qualification.toLowerCase().includes(query))
    );
    this.cdr.detectChanges();
  }

  isSubjectSelected(subjectName: string, isEdit = false): boolean {
    if (isEdit) {
      return this.editSelectedSubjects.includes(subjectName);
    }
    return this.selectedSubjects.includes(subjectName);
  }

  toggleSubjectSelection(subjectName: string, isEdit = false): void {
    if (isEdit) {
      const idx = this.editSelectedSubjects.indexOf(subjectName);
      if (idx > -1) {
        this.editSelectedSubjects.splice(idx, 1);
      } else {
        this.editSelectedSubjects.push(subjectName);
      }
    } else {
      const idx = this.selectedSubjects.indexOf(subjectName);
      if (idx > -1) {
        this.selectedSubjects.splice(idx, 1);
      } else {
        this.selectedSubjects.push(subjectName);
      }
    }
  }

  onFileSelected(event: any, isEdit = false): void {
    const file = event.target.files[0];
    if (file) {
      if (isEdit) {
        this.editPhotoFile = file;
        this.editPhotoFileName = file.name;
      } else {
        this.photoFile = file;
        this.photoFileName = file.name;
      }
    }
  }

  getPhotoUrl(photoPath: string): string {
    if (!photoPath) return 'assets/images/faces/9.jpg';
    if (photoPath.startsWith('http')) return photoPath;
    return `${environment.baseUrl}${photoPath}`;
  }

  // --- Time Slot Utility Functions ---
  formatTimeTo12H(timeStr: string): string {
    if (!timeStr) return '';
    if (/AM|PM/i.test(timeStr)) return timeStr.trim();
    const parts = timeStr.split(':');
    let hour = parseInt(parts[0], 10);
    const min = parts[1] ? parts[1].trim() : '00';
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    const formattedHour = hour < 10 ? '0' + hour : '' + hour;
    return `${formattedHour}:${min} ${ampm}`;
  }

  formatTimeTo24H(time12: string): string {
    if (!time12) return '09:00';
    if (!/AM|PM/i.test(time12)) return time12;
    const match = time12.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return '09:00';
    let hour = parseInt(match[1], 10);
    const min = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${min}`;
  }

  // --- Add Modal Time Slot Methods ---
  toggleSlotDay(day: string): void {
    const index = this.selectedSlotDays.indexOf(day);
    if (index > -1) {
      this.selectedSlotDays.splice(index, 1);
    } else {
      this.selectedSlotDays.push(day);
    }
  }

  selectAllSlotDays(): void {
    this.selectedSlotDays = [...this.daysOfWeek];
  }

  selectWeekdaySlotDays(): void {
    this.selectedSlotDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }

  selectWeekendSlotDays(): void {
    this.selectedSlotDays = ['Saturday', 'Sunday'];
  }

  clearSlotDays(): void {
    this.selectedSlotDays = [];
  }

  addSlot(): void {
    if (!this.selectedSlotDays.length) {
      this.toastr.warning('Please select at least one day for the time slot.', 'Validation');
      return;
    }
    if (!this.slotStartTime || !this.slotEndTime) {
      this.toastr.warning('Please select both start time and end time.', 'Validation');
      return;
    }
    if (this.slotStartTime === this.slotEndTime) {
      this.toastr.warning('Start time and End time cannot be the same.', 'Validation');
      return;
    }

    const start12 = this.formatTimeTo12H(this.slotStartTime);
    const end12 = this.formatTimeTo12H(this.slotEndTime);

    let addedCount = 0;
    this.selectedSlotDays.forEach(day => {
      const exists = this.timeSlots.some(
        s => (s.day_of_week === day || s.day === day) && s.start_time === start12 && s.end_time === end12
      );
      if (!exists) {
        this.timeSlots.push({
          day_of_week: day,
          day: day,
          start_time: start12,
          end_time: end12,
          status: 'active'
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.toastr.success(`Added ${addedCount} time slot(s).`, 'Success');
    } else {
      this.toastr.info('Selected time slot(s) already exist.', 'Info');
    }
  }

  removeSlot(index: number): void {
    this.timeSlots.splice(index, 1);
  }

  clearAllSlots(): void {
    this.timeSlots = [];
  }

  // --- Edit Modal Time Slot Methods ---
  toggleEditSlotDay(day: string): void {
    const index = this.editSelectedSlotDays.indexOf(day);
    if (index > -1) {
      this.editSelectedSlotDays.splice(index, 1);
    } else {
      this.editSelectedSlotDays.push(day);
    }
  }

  selectAllEditSlotDays(): void {
    this.editSelectedSlotDays = [...this.daysOfWeek];
  }

  selectWeekdayEditSlotDays(): void {
    this.editSelectedSlotDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }

  selectWeekendEditSlotDays(): void {
    this.editSelectedSlotDays = ['Saturday', 'Sunday'];
  }

  clearEditSlotDays(): void {
    this.editSelectedSlotDays = [];
  }

  addEditSlot(): void {
    if (!this.editSelectedSlotDays.length) {
      this.toastr.warning('Please select at least one day for the time slot.', 'Validation');
      return;
    }
    if (!this.editSlotStartTime || !this.editSlotEndTime) {
      this.toastr.warning('Please select both start time and end time.', 'Validation');
      return;
    }
    if (this.editSlotStartTime === this.editSlotEndTime) {
      this.toastr.warning('Start time and End time cannot be the same.', 'Validation');
      return;
    }

    const start12 = this.formatTimeTo12H(this.editSlotStartTime);
    const end12 = this.formatTimeTo12H(this.editSlotEndTime);

    let addedCount = 0;
    this.editSelectedSlotDays.forEach(day => {
      const exists = this.editTimeSlots.some(
        s => (s.day_of_week === day || s.day === day) && s.start_time === start12 && s.end_time === end12
      );
      if (!exists) {
        this.editTimeSlots.push({
          day_of_week: day,
          day: day,
          start_time: start12,
          end_time: end12,
          status: 'active'
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.toastr.success(`Added ${addedCount} time slot(s).`, 'Success');
    } else {
      this.toastr.info('Selected time slot(s) already exist.', 'Info');
    }
  }

  removeEditSlot(index: number): void {
    this.editTimeSlots.splice(index, 1);
  }

  clearAllEditSlots(): void {
    this.editTimeSlots = [];
  }

  // --- Add Mentor Submission ---
  open(content: any) {
    this.fullName = '';
    this.qualification = '';
    this.mobileNumber = '';
    this.email = '';
    this.address = '';
    this.aboutUs = '';
    this.experience = '';
    this.selectedSubjects = [];
    this.photoFile = null;
    this.photoFileName = '';

    // Reset Slots
    this.timeSlots = [];
    this.selectedSlotDays = ['Monday'];
    this.slotStartTime = '09:00';
    this.slotEndTime = '11:00';

    this.modalService.open(content, {
      centered: true,
      size: 'xl'
    });
  }

  addMentor(modal: any): void {
    if (!this.fullName.trim() || !this.mobileNumber.trim()) {
      this.toastr.error('Full Name and Mobile Number are required.', 'Validation Error');
      return;
    }

    if (!/^[0-9]{10}$/.test(this.mobileNumber.trim())) {
      this.toastr.error('Please enter a valid 10-digit mobile number.', 'Validation Error');
      return;
    }

    // Auto-add slot if user selected days & times but didn't click inner "+ Add Slot" button
    if (this.timeSlots.length === 0 && this.selectedSlotDays.length > 0 && this.slotStartTime && this.slotEndTime && this.slotStartTime !== this.slotEndTime) {
      const start12 = this.formatTimeTo12H(this.slotStartTime);
      const end12 = this.formatTimeTo12H(this.slotEndTime);
      this.selectedSlotDays.forEach(day => {
        this.timeSlots.push({
          day_of_week: day,
          day: day,
          start_time: start12,
          end_time: end12,
          status: 'active'
        });
      });
    }

    const formData = new FormData();
    formData.append('full_name', this.fullName.trim());
    formData.append('qualification', this.qualification.trim());
    formData.append('mobile_number', this.mobileNumber.trim());
    formData.append('email', this.email.trim());
    formData.append('address', this.address.trim());
    formData.append('about_us', this.aboutUs.trim());
    formData.append('experience', this.experience.trim());
    formData.append('expert_in', this.selectedSubjects.join(', '));
    if (this.photoFile) {
      formData.append('photo', this.photoFile);
    }

    if (this.timeSlots.length > 0) {
      const normalizedSlots = this.timeSlots.map(s => ({
        day_of_week: s.day_of_week || s.day,
        day: s.day_of_week || s.day,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status || 'active'
      }));
      formData.append('time_slots', JSON.stringify(normalizedSlots));
    }

    this.http.post<any>(this.apiUrl, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Mentor added successfully with available slots', 'Success');
          this.loadMentors();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to add mentor', 'Error');
        }
      },
      error: (err) => {
        console.error('Error adding mentor:', err);
        const errMsg = err.error?.message || 'Server error while adding mentor';
        this.toastr.error(errMsg, 'Registration Error', { timeOut: 6000 });
      }
    });
  }

  // --- Edit Mentor Modal ---
  openEdit(mentor: any, content: any): void {
    this.selectedMentor = mentor;
    this.editFullName = mentor.full_name;
    this.editQualification = mentor.qualification || '';
    this.editMobileNumber = mentor.mobile_number;
    this.editEmail = mentor.email || '';
    this.editAddress = mentor.address || '';
    this.editAboutUs = mentor.about_us || '';
    this.editExperience = mentor.experience || '';
    this.editSelectedSubjects = mentor.expert_in ? mentor.expert_in.split(', ').map((s: string) => s.trim()) : [];
    this.editPhotoFile = null;
    this.editPhotoFileName = mentor.photo ? mentor.photo.split('/').pop() : '';

    this.editSelectedSlotDays = [];
    this.editSlotStartTime = '09:00';
    this.editSlotEndTime = '11:00';

    // Parse existing slots or fetch by ID
    let initialSlots = mentor.time_slots;
    if (typeof initialSlots === 'string') {
      try { initialSlots = JSON.parse(initialSlots); } catch (e) { initialSlots = []; }
    }
    this.editTimeSlots = Array.isArray(initialSlots) ? JSON.parse(JSON.stringify(initialSlots)) : [];

    // Fetch fresh mentor by ID to ensure all slot relations are loaded
    this.http.get<any>(`${this.apiUrl}/${mentor.id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const freshData = res.data;
          let slots = freshData.time_slots;
          if (typeof slots === 'string') {
            try { slots = JSON.parse(slots); } catch (e) { slots = []; }
          }
          if (Array.isArray(slots) && slots.length > 0) {
            this.editTimeSlots = slots.map((s: any) => ({
              id: s.id,
              mentor_id: s.mentor_id || freshData.id,
              day_of_week: s.day_of_week || s.day,
              day: s.day_of_week || s.day,
              start_time: s.start_time,
              end_time: s.end_time,
              status: s.status || 'active'
            }));
            this.cdr.detectChanges();
          } else {
            // Also try /slots if time_slots in mentor is empty
            this.http.get<any>(`${this.apiUrl}/${mentor.id}/slots`, { headers: this.getHeaders() }).subscribe({
              next: (slotRes) => {
                if (slotRes.success && slotRes.data) {
                  let dSlots = slotRes.data;
                  if (typeof dSlots === 'string') {
                    try { dSlots = JSON.parse(dSlots); } catch (e) { dSlots = []; }
                  }
                  if (Array.isArray(dSlots) && dSlots.length > 0) {
                    this.editTimeSlots = dSlots.map((s: any) => ({
                      id: s.id,
                      mentor_id: s.mentor_id || freshData.id,
                      day_of_week: s.day_of_week || s.day,
                      day: s.day_of_week || s.day,
                      start_time: s.start_time,
                      end_time: s.end_time,
                      status: s.status || 'active'
                    }));
                    this.cdr.detectChanges();
                  }
                }
              }
            });
          }
        }
      },
      error: (err) => {
        console.error('Error fetching mentor slots for edit:', err);
      }
    });

    this.modalService.open(content, {
      centered: true,
      size: 'xl'
    });
  }

  updateMentor(modal: any): void {
    if (!this.editFullName.trim() || !this.editMobileNumber.trim()) {
      this.toastr.error('Full Name and Mobile Number are required.', 'Validation Error');
      return;
    }

    if (!/^[0-9]{10}$/.test(this.editMobileNumber.trim())) {
      this.toastr.error('Please enter a valid 10-digit mobile number.', 'Validation Error');
      return;
    }

    // Auto-add slot if user selected days & times in edit but didn't click inner "+ Add Slot"
    if (this.editSelectedSlotDays.length > 0 && this.editSlotStartTime && this.editSlotEndTime && this.editSlotStartTime !== this.editSlotEndTime) {
      const start12 = this.formatTimeTo12H(this.editSlotStartTime);
      const end12 = this.formatTimeTo12H(this.editSlotEndTime);
      this.editSelectedSlotDays.forEach(day => {
        const exists = this.editTimeSlots.some(
          s => (s.day_of_week === day || s.day === day) && s.start_time === start12 && s.end_time === end12
        );
        if (!exists) {
          this.editTimeSlots.push({
            day_of_week: day,
            day: day,
            start_time: start12,
            end_time: end12,
            status: 'active'
          });
        }
      });
    }

    const formData = new FormData();
    formData.append('full_name', this.editFullName.trim());
    formData.append('qualification', this.editQualification.trim());
    formData.append('mobile_number', this.editMobileNumber.trim());
    formData.append('email', this.editEmail.trim());
    formData.append('address', this.editAddress.trim());
    formData.append('about_us', this.editAboutUs.trim());
    formData.append('experience', this.editExperience.trim());
    formData.append('expert_in', this.editSelectedSubjects.join(', '));
    if (this.editPhotoFile) {
      formData.append('photo', this.editPhotoFile);
    }

    const normalizedSlots = this.editTimeSlots.map(s => ({
      id: s.id,
      day_of_week: s.day_of_week || s.day,
      day: s.day_of_week || s.day,
      start_time: s.start_time,
      end_time: s.end_time,
      status: s.status || 'active'
    }));
    formData.append('time_slots', JSON.stringify(normalizedSlots));

    const url = `${this.apiUrl}/${this.selectedMentor.id}`;
    this.http.put<any>(url, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Mentor updated successfully', 'Success');
          this.loadMentors();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update mentor', 'Error');
        }
      },
      error: (err) => {
        console.error('Error updating mentor:', err);
        const errMsg = err.error?.message || 'Server error while updating mentor';
        this.toastr.error(errMsg, 'Update Error', { timeOut: 6000 });
      }
    });
  }

  // --- View Details (Eye Icon) ---
  openView(mentor: any, content: any): void {
    let slots = mentor.time_slots;
    if (typeof slots === 'string') {
      try { slots = JSON.parse(slots); } catch (e) { slots = []; }
    }
    const currentSlots = Array.isArray(slots) ? [...slots] : [];
    this.selectedMentor = {
      ...mentor,
      time_slots: currentSlots
    };

    // Fetch fresh details with slots from GET /api/v1/mentor/:id
    this.http.get<any>(`${this.apiUrl}/${mentor.id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          let freshSlots = res.data.time_slots || res.data.slots;
          if (typeof freshSlots === 'string') {
            try { freshSlots = JSON.parse(freshSlots); } catch (e) { freshSlots = []; }
          }
          const finalSlots = (Array.isArray(freshSlots) && freshSlots.length > 0)
            ? freshSlots
            : currentSlots;

          this.selectedMentor = {
            ...this.selectedMentor,
            ...res.data,
            time_slots: finalSlots
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading mentor view details:', err)
    });

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  // --- Dedicated Slots Management Modal ---
  openManageSlots(mentor: any, content: any): void {
    this.activeSlotMentor = { ...mentor };
    this.manageSelectedDays = [];
    this.manageStartTime = '09:00';
    this.manageEndTime = '11:00';
    this.manageFilterDay = 'All';

    // Immediately populate with existing mentor slots if available
    let initialSlots = mentor.time_slots;
    if (typeof initialSlots === 'string') {
      try { initialSlots = JSON.parse(initialSlots); } catch (e) { initialSlots = []; }
    }
    this.manageSlotsList = Array.isArray(initialSlots) ? [...initialSlots] : [];

    // Load fresh slots from API
    this.loadMentorSlots(mentor.id);

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  onFilterDayChange(): void {
    if (this.activeSlotMentor) {
      this.loadMentorSlots(this.activeSlotMentor.id, this.manageFilterDay);
    }
  }

  loadMentorSlots(mentorId: number, day?: string): void {
    this.isLoadingSlots = true;
    let url = `${this.apiUrl}/${mentorId}/slots`;
    if (day && day !== 'All') {
      url += `?day=${encodeURIComponent(day)}`;
    }
    this.http.get<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoadingSlots = false;
        if (res.success) {
          let slots = res.data;
          if (res.data && !Array.isArray(res.data)) {
            if (Array.isArray(res.data.time_slots)) {
              slots = res.data.time_slots;
            } else if (Array.isArray(res.data.slots)) {
              slots = res.data.slots;
            } else if (typeof res.data.time_slots === 'string') {
              try { slots = JSON.parse(res.data.time_slots); } catch (e) { slots = []; }
            }
          }
          if (typeof slots === 'string') {
            try { slots = JSON.parse(slots); } catch (e) { slots = []; }
          }
          this.manageSlotsList = Array.isArray(slots) ? slots : [];

          // If GET /mentor/:id/slots returns empty array (and day is All), check GET /mentor/:id
          if (this.manageSlotsList.length === 0 && (!day || day === 'All')) {
            this.http.get<any>(`${this.apiUrl}/${mentorId}`, { headers: this.getHeaders() }).subscribe({
              next: (mentorRes) => {
                if (mentorRes.success && mentorRes.data) {
                  let mSlots = mentorRes.data.time_slots;
                  if (typeof mSlots === 'string') {
                    try { mSlots = JSON.parse(mSlots); } catch (e) { mSlots = []; }
                  }
                  if (Array.isArray(mSlots) && mSlots.length > 0) {
                    this.manageSlotsList = mSlots;
                    const found = this.mentors.find(m => m.id === mentorId);
                    if (found) {
                      found.time_slots = [...mSlots];
                    }
                    this.cdr.detectChanges();
                  }
                }
              }
            });
          }

          const found = this.mentors.find(m => m.id === mentorId);
          if (found && (!day || day === 'All') && this.manageSlotsList.length > 0) {
            found.time_slots = [...this.manageSlotsList];
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoadingSlots = false;
        console.error('Error fetching slots via /slots:', err);
        // Fallback to GET /mentor/:id
        this.http.get<any>(`${this.apiUrl}/${mentorId}`, { headers: this.getHeaders() }).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              let slots = res.data.time_slots;
              if (typeof slots === 'string') {
                try { slots = JSON.parse(slots); } catch (e) { slots = []; }
              }
              slots = Array.isArray(slots) ? slots : [];
              if (day && day !== 'All') {
                const lower = day.toLowerCase();
                this.manageSlotsList = slots.filter((s: any) => (s.day_of_week || s.day || '').toLowerCase() === lower);
              } else {
                this.manageSlotsList = slots;
                const found = this.mentors.find(m => m.id === mentorId);
                if (found) {
                  found.time_slots = [...this.manageSlotsList];
                }
              }
              this.cdr.detectChanges();
            }
          }
        });
      }
    });
  }

  toggleManageSlotDay(day: string): void {
    const index = this.manageSelectedDays.indexOf(day);
    if (index > -1) {
      this.manageSelectedDays.splice(index, 1);
    } else {
      this.manageSelectedDays.push(day);
    }
  }

  selectAllManageDays(): void {
    this.manageSelectedDays = [...this.daysOfWeek];
  }

  selectWeekdayManageDays(): void {
    this.manageSelectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }

  clearManageDays(): void {
    this.manageSelectedDays = [];
  }

  addSlotsDirectly(): void {
    if (!this.manageSelectedDays.length) {
      this.toastr.warning('Please select at least one day.', 'Validation');
      return;
    }
    if (!this.manageStartTime || !this.manageEndTime) {
      this.toastr.warning('Please select start and end time.', 'Validation');
      return;
    }
    if (this.manageStartTime === this.manageEndTime) {
      this.toastr.warning('Start time and End time cannot be the same.', 'Validation');
      return;
    }

    const start12 = this.formatTimeTo12H(this.manageStartTime);
    const end12 = this.formatTimeTo12H(this.manageEndTime);

    const newSlots = this.manageSelectedDays.map(day => ({
      day_of_week: day,
      day: day,
      start_time: start12,
      end_time: end12,
      status: 'active'
    }));

    const url = `${this.apiUrl}/${this.activeSlotMentor.id}/slots`;
    const payload = {
      time_slots: newSlots,
      day: newSlots[0].day,
      day_of_week: newSlots[0].day_of_week,
      start_time: newSlots[0].start_time,
      end_time: newSlots[0].end_time,
      status: 'active'
    };

    this.http.post<any>(url, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Time slot(s) added successfully!', 'Success');
          this.manageSelectedDays = [];
          this.loadMentorSlots(this.activeSlotMentor.id, this.manageFilterDay);
          this.loadMentors();
        } else {
          this.toastr.error(res.message || 'Failed to add time slots', 'Error');
        }
      },
      error: (err) => {
        console.error('Error adding slots:', err);
        // Fallback: try direct array payload
        this.http.post<any>(url, newSlots, { headers: this.getHeaders() }).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastr.success('Time slot(s) added successfully!', 'Success');
              this.manageSelectedDays = [];
              this.loadMentorSlots(this.activeSlotMentor.id, this.manageFilterDay);
              this.loadMentors();
            }
          },
          error: (e) => {
            this.toastr.error(e.error?.message || err.error?.message || 'Failed to add time slots', 'Error');
          }
        });
      }
    });
  }

  toggleSlotStatusDirectly(slot: MentorTimeSlot): void {
    const newStatus = slot.status === 'inactive' ? 'active' : 'inactive';
    const url = `${this.apiUrl}/${this.activeSlotMentor.id}/slots/${slot.id}`;
    this.http.put<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          slot.status = newStatus;
          this.toastr.success(`Slot marked as ${newStatus}`, 'Success');
          this.loadMentors();
        } else {
          this.toastr.error(res.message || 'Failed to update slot', 'Error');
        }
      },
      error: (err) => {
        console.error('Error toggling slot status:', err);
        this.toastr.error(err.error?.message || 'Failed to update slot status', 'Error');
      }
    });
  }

  deleteSlotDirectly(slotId: number): void {
    if (!confirm('Are you sure you want to delete this time slot?')) return;
    const url = `${this.apiUrl}/${this.activeSlotMentor.id}/slots/${slotId}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Time slot deleted successfully', 'Success');
          this.manageSlotsList = this.manageSlotsList.filter(s => s.id !== slotId);
          const found = this.mentors.find(m => m.id === this.activeSlotMentor.id);
          if (found) {
            found.time_slots = [...this.manageSlotsList];
          }
          this.loadMentors();
        } else {
          this.toastr.error(res.message || 'Failed to delete time slot', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting slot:', err);
        this.toastr.error(err.error?.message || 'Failed to delete time slot', 'Error');
      }
    });
  }

  getFilteredManageSlots(): MentorTimeSlot[] {
    if (this.manageFilterDay === 'All') {
      return this.manageSlotsList;
    }
    const filterLower = this.manageFilterDay.toLowerCase().trim();
    return this.manageSlotsList.filter(s => {
      const d = (s.day_of_week || s.day || '').toLowerCase().trim();
      return d === filterLower;
    });
  }

  openDelete(mentor: any, content: any): void {
    this.selectedMentor = mentor;
    this.modalService.open(content, {
      centered: true
    });
  }

  deleteMentor(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Mentor deleted successfully', 'Success');
          this.loadMentors();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete mentor', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting mentor:', err);
        this.toastr.error(err.error?.message || 'Server error while deleting mentor', 'Error');
      }
    });
  }

  confirmMentor(mentor: any): void {
    if (!mentor.email) {
      this.toastr.error('This mentor does not have an email address registered.', 'Error');
      return;
    }
    if (!confirm(`Are you sure you want to confirm mentor ${mentor.full_name}?`)) {
      return;
    }
    const url = `${this.apiUrl}/${mentor.id}/confirm`;
    this.http.post<any>(url, {}, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message || 'Mentor confirmed successfully!', 'Success');
          this.loadMentors();
          
          if (!res.emailSent) {
            alert(`Mentor Confirmed, but credentials email could not be sent.\n\nPlease copy credentials manually:\nEmail: ${res.data.email}\nPassword: ${res.data.password}`);
          }
        } else {
          this.toastr.error(res.message || 'Failed to confirm mentor', 'Error');
        }
      },
      error: (err) => {
        console.error('Error confirming mentor:', err);
        this.toastr.error(err.error?.message || 'Server error while confirming mentor', 'Error');
      }
    });
  }

  copyMentorLink(mentor: any): void {
    if (!mentor.email) {
      this.toastr.error('Mentor email is missing.', 'Error');
      return;
    }
    const origin = window.location.origin;
    const loginUrl = `${origin}/auth/login?email=${encodeURIComponent(mentor.email)}`;
    
    navigator.clipboard.writeText(loginUrl).then(() => {
      this.toastr.success('Mentor login link copied to clipboard!', 'Copied');
    }).catch(err => {
      console.error('Could not copy text: ', err);
      this.toastr.error('Failed to copy link. Please copy manually.', 'Error');
    });
  }

  // --- Slot-Wise Student Bookings Explorer Modal ---
  openMentorSlotBookings(mentor: any, content: any): void {
    this.activeBookingMentor = mentor;
    this.activeMentorSlotBookingsData = null;
    this.isLoadingMentorSlotBookings = true;

    const primaryUrl = `${this.mentorBookingsAdminUrl}/mentor/${mentor.id}/slots`;
    const fallbackUrl1 = `${this.mentorBookingsAdminUrl}/slots-bookings?mentor_id=${mentor.id}`;
    const fallbackUrl2 = `${environment.apiUrl}/mentor/${mentor.id}/slots-bookings`;

    this.http.get<any>(primaryUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoadingMentorSlotBookings = false;
        if (res.status || res.success) {
          this.activeMentorSlotBookingsData = res.data || res;
        } else {
          this.fetchSlotBookingsFallback(fallbackUrl1, fallbackUrl2);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.fetchSlotBookingsFallback(fallbackUrl1, fallbackUrl2);
      }
    });

    this.modalService.open(content, {
      centered: true,
      size: 'xl'
    });
  }

  private fetchSlotBookingsFallback(fallbackUrl1: string, fallbackUrl2: string): void {
    this.http.get<any>(fallbackUrl1, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoadingMentorSlotBookings = false;
        if (res.status || res.success) {
          this.activeMentorSlotBookingsData = res.data || res;
        } else {
          this.fetchSlotBookingsNextFallback(fallbackUrl2);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.fetchSlotBookingsNextFallback(fallbackUrl2);
      }
    });
  }

  private fetchSlotBookingsNextFallback(fallbackUrl2: string): void {
    this.http.get<any>(fallbackUrl2, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isLoadingMentorSlotBookings = false;
        if (res.status || res.success) {
          this.activeMentorSlotBookingsData = res.data || res;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingMentorSlotBookings = false;
        console.error('Error fetching slot bookings:', err);
        this.toastr.error('Failed to load slot bookings for this mentor.', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  navigateToMentorBookings(mentorId: number, modal?: any): void {
    if (modal) {
      modal.dismiss();
    }
    this.router.navigate(['/masters/mentor-bookings'], {
      queryParams: {
        mentor_id: mentorId,
        view: 'slots'
      }
    });
  }

  copyMeetLink(url: string | null | undefined): void {
    if (!url) {
      this.toastr.warning('No Google Meet link attached.', 'Warning');
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.success('Google Meet link copied to clipboard!', 'Copied');
    }).catch(err => {
      console.error('Copy failed:', err);
      this.toastr.error('Failed to copy link', 'Error');
    });
  }
}
