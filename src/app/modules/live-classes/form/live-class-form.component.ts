import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  LiveClassService,
  LiveClass,
  LiveClassStatus,
  MentorOption,
  SubjectOption,
  ClassType
} from '../live-class.service';

@Component({
  selector: 'app-live-class-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './live-class-form.component.html',
  styleUrl: './live-class-form.component.scss'
})
export class LiveClassFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  classId?: number;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  mentors: MentorOption[] = [];
  subjects: SubjectOption[] = [];
  selectedMentorData?: MentorOption;

  // Discussion points & Learning outcomes array helpers
  discussionPointsList: string[] = [];
  newDiscussionPoint: string = '';

  learningOutcomesList: string[] = [];
  newLearningOutcome: string = '';

  // Thumbnail handling
  thumbnailFile: File | null = null;
  thumbnailPreview: string | null = null;
  existingThumbnailUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    public liveClassService: LiveClassService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  getMentorPhoto(photo: string | null | undefined): string {
    if (!photo) return 'assets/images/faces/9.jpg';
    return this.liveClassService.getAssetUrl(photo);
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDropdowns();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.classId = Number(params['id']);
        this.loadClassDetails(this.classId);
      }
    });
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      mentor_id: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      topic: [''],
      description: [''],
      class_type: ['group', [Validators.required]],
      class_date: [today, [Validators.required]],
      start_time: ['10:00', [Validators.required]],
      end_time: ['11:00', [Validators.required]],
      duration: [60, [Validators.required, Validators.min(15)]],
      timezone: ['Asia/Kolkata'],
      max_students: [10, [Validators.required, Validators.min(1)]],
      is_free: [false],
      use_mentor_default: [false],
      fees: [0, [Validators.min(0)]],
      discounted_fees: [0, [Validators.min(0)]],
      status: ['draft', [Validators.required]]
    });

    // Auto-update duration on start_time or end_time changes
    this.form.get('start_time')?.valueChanges.subscribe(() => this.calculateDuration());
    this.form.get('end_time')?.valueChanges.subscribe(() => this.calculateDuration());

    // When class type changes to individual, clamp max_students to 1
    this.form.get('class_type')?.valueChanges.subscribe(type => {
      if (type === 'individual') {
        this.form.get('max_students')?.setValue(1);
        this.form.get('max_students')?.disable();
      } else {
        if (this.form.get('max_students')?.value === 1) {
          this.form.get('max_students')?.setValue(10);
        }
        this.form.get('max_students')?.enable();
      }
    });

    // When "is_free" is toggled
    this.form.get('is_free')?.valueChanges.subscribe(isFree => {
      if (isFree) {
        this.form.get('fees')?.setValue(0);
        this.form.get('discounted_fees')?.setValue(0);
        this.form.get('use_mentor_default')?.setValue(false);
      }
    });

    // When "use_mentor_default" is toggled
    this.form.get('use_mentor_default')?.valueChanges.subscribe(useDefault => {
      if (useDefault && this.selectedMentorData) {
        this.form.get('fees')?.setValue(this.selectedMentorData.default_charges || 0);
        this.form.get('is_free')?.setValue(false);
      }
    });
  }

  loadDropdowns(): void {
    this.liveClassService.getMentors().subscribe(mentors => {
      this.mentors = mentors;
      if (this.form.get('mentor_id')?.value) {
        this.onMentorChange(this.form.get('mentor_id')?.value);
      }
      this.cdr.detectChanges();
    });

    this.liveClassService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
      this.cdr.detectChanges();
    });
  }

  onMentorChange(mentorId: any): void {
    const id = Number(mentorId);
    this.selectedMentorData = this.mentors.find(m => m.id === id);
    if (this.form.get('use_mentor_default')?.value && this.selectedMentorData) {
      this.form.get('fees')?.setValue(this.selectedMentorData.default_charges || 0);
    }
  }

  loadClassDetails(id: number): void {
    this.isLoading = true;
    this.liveClassService.getLiveClassById(id).subscribe({
      next: (res) => {
        const c = res.data;
        if (!c) {
          this.toastr.error('Live class not found.', 'Error');
          this.router.navigate(['/live-classes/list']);
          return;
        }

        // Format date and time
        const classDate = c.class_date ? String(c.class_date).substring(0, 10) : '';
        const startTime = c.start_time ? String(c.start_time).substring(0, 5) : '10:00';
        const endTime = c.end_time ? String(c.end_time).substring(0, 5) : '11:00';

        this.form.patchValue({
          mentor_id: c.mentor_id || c.mentor?.id,
          subject: c.subject,
          title: c.title,
          topic: c.topic || '',
          description: c.description || '',
          class_type: c.class_type || 'group',
          class_date: classDate,
          start_time: startTime,
          end_time: endTime,
          duration: c.duration || 60,
          timezone: c.timezone || 'Asia/Kolkata',
          max_students: c.capacity?.max_students || (c as any).max_students || 10,
          is_free: c.pricing?.is_free || false,
          use_mentor_default: c.pricing?.use_mentor_default || false,
          fees: c.pricing?.fees || (c as any).fees || 0,
          discounted_fees: c.pricing?.discounted_fees || (c as any).discounted_fees || 0,
          status: c.status || 'draft'
        });

        this.onMentorChange(c.mentor_id || c.mentor?.id);

        if (c.discussion_points) {
          this.discussionPointsList = Array.isArray(c.discussion_points) 
            ? [...c.discussion_points] 
            : [String(c.discussion_points)];
        }

        if (c.learning_outcomes) {
          this.learningOutcomesList = Array.isArray(c.learning_outcomes)
            ? [...c.learning_outcomes]
            : [String(c.learning_outcomes)];
        }

        if (c.thumbnail) {
          this.existingThumbnailUrl = this.liveClassService.getAssetUrl(c.thumbnail);
        }

        if (c.class_type === 'individual') {
          this.form.get('max_students')?.disable();
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading class details for edit:', err);
        this.toastr.error('Failed to load live class details.', 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateDuration(): void {
    const start = this.form.get('start_time')?.value;
    const end = this.form.get('end_time')?.value;
    if (start && end) {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff <= 0) diff += 24 * 60; // Crosses midnight
      if (diff >= 15) {
        this.form.get('duration')?.setValue(diff, { emitEvent: false });
      }
    }
  }

  // Discussion points helpers
  addDiscussionPoint(): void {
    const val = this.newDiscussionPoint.trim();
    if (val && !this.discussionPointsList.includes(val)) {
      this.discussionPointsList.push(val);
      this.newDiscussionPoint = '';
    }
  }

  removeDiscussionPoint(index: number): void {
    this.discussionPointsList.splice(index, 1);
  }

  // Learning outcomes helpers
  addLearningOutcome(): void {
    const val = this.newLearningOutcome.trim();
    if (val && !this.learningOutcomesList.includes(val)) {
      this.learningOutcomesList.push(val);
      this.newLearningOutcome = '';
    }
  }

  removeLearningOutcome(index: number): void {
    this.learningOutcomesList.splice(index, 1);
  }

  // File upload
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastr.warning('Please select an image file (JPG, PNG, WebP).', 'Invalid File');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.warning('Image file size must be less than 5MB.', 'File Too Large');
        return;
      }
      this.thumbnailFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeThumbnail(): void {
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
    this.existingThumbnailUrl = null;
  }

  // Effective fee calculator for UI preview
  get previewEffectiveFee(): number {
    if (this.form.get('is_free')?.value) return 0;
    if (this.form.get('use_mentor_default')?.value && this.selectedMentorData) {
      return Number(this.selectedMentorData.default_charges || 0);
    }
    const discounted = Number(this.form.get('discounted_fees')?.value || 0);
    const regular = Number(this.form.get('fees')?.value || 0);
    if (discounted > 0) return discounted;
    return regular;
  }

  // Submission handler (Draft or Published)
  onSubmit(targetStatus: LiveClassStatus): void {
    this.form.get('status')?.setValue(targetStatus);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Please complete all required fields correctly.', 'Validation Error');
      return;
    }

    const formValues = this.form.getRawValue();

    const formData = new FormData();
    formData.append('mentor_id', String(formValues.mentor_id));
    formData.append('subject', String(formValues.subject).trim());
    formData.append('title', String(formValues.title).trim());
    if (formValues.topic) formData.append('topic', String(formValues.topic).trim());
    if (formValues.description) formData.append('description', String(formValues.description).trim());

    formData.append('class_type', formValues.class_type);
    formData.append('class_date', formValues.class_date);
    formData.append('start_time', formValues.start_time);
    formData.append('end_time', formValues.end_time);
    formData.append('duration', String(formValues.duration));
    formData.append('timezone', formValues.timezone || 'Asia/Kolkata');
    formData.append('max_students', String(formValues.max_students));
    formData.append('status', targetStatus);

    formData.append('use_mentor_default', formValues.use_mentor_default ? '1' : '0');
    formData.append('fees', String(formValues.is_free ? 0 : formValues.fees || 0));
    formData.append('discounted_fees', String(formValues.is_free ? 0 : formValues.discounted_fees || 0));

    // Arrays formatted as JSON strings
    formData.append('discussion_points', JSON.stringify(this.discussionPointsList));
    formData.append('learning_outcomes', JSON.stringify(this.learningOutcomesList));

    if (this.thumbnailFile) {
      formData.append('thumbnail', this.thumbnailFile);
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.classId) {
      this.liveClassService.updateLiveClass(this.classId, formData).subscribe({
        next: (res) => {
          this.toastr.success(res.message || 'Live class updated successfully.', 'Success');
          this.isSubmitting = false;
          this.router.navigate(['/live-classes/details', this.classId]);
        },
        error: (err) => {
          console.error('Error updating live class:', err);
          this.toastr.error(err.error?.message || 'Failed to update live class.', 'Error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.liveClassService.createLiveClass(formData).subscribe({
        next: (res) => {
          const created = res.data;
          this.toastr.success(res.message || 'Live class created successfully.', 'Success');
          this.isSubmitting = false;
          if (created?.id) {
            this.router.navigate(['/live-classes/details', created.id]);
          } else {
            this.router.navigate(['/live-classes/list']);
          }
        },
        error: (err) => {
          console.error('Error creating live class:', err);
          this.toastr.error(err.error?.message || 'Failed to create live class.', 'Error');
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.classId) {
      this.router.navigate(['/live-classes/details', this.classId]);
    } else {
      this.router.navigate(['/live-classes/list']);
    }
  }
}
