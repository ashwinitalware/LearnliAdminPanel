import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';
import { SharedModule } from '../../../shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [SpkReusableTables, SpkDropdowns, ReactiveFormsModule, SharedModule, QuillModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss'
})
export class CourseList implements OnInit {
  courseForm!: FormGroup;
  languages: any[] = [];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLanguages();
  }

  loadLanguages(): void {
    this.http.get<any>(`${environment.apiUrl}/language?status=active`).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.languages = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading languages in course-list:', err);
      }
    });
  }

  open(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'xl'
    });
  }

  openAssignmentModal(content: any) {
  this.modalService.open(content, {
    centered: true,
    size: 'lg'
  });
}

  openDeleteModal(content: any) {
  this.modalService.open(content, {
    centered: true,
    size: 'sm'
  });
}

  initForm(): void {
    this.courseForm = this.fb.group({
      // Row 1
      courseTitle: ['', [Validators.required]],
      category: ['', [Validators.required]],
      
      // Row 2
      courseType: ['Course', [Validators.required]],
      language: ['', [Validators.required]],

      // Row 3
      subject: ['', [Validators.required]],
      courseLevel: ['', [Validators.required]],

      // Row 4
      organization: ['', [Validators.required]],
      instructor: ['', [Validators.required]],

      // Row 5
      courseDuration: ['', [Validators.required]],
      courseTag: [''],

      // Row 6 - Media
      videoSource: ['', [Validators.required]],
      thumbnail: [null, [Validators.required]],
      isDownloadable: [false],

      // Row 7 - Status & Pricing
      isFeatured: [false],
      isFree: [false],
      discountThisCourse: [false],
      coursePrice: [0, [Validators.min(0)]],

      // Row 8 - Editor Descriptions
      shortDescription: [''],
      description: [''],
      isPrivateCourse: [false]
    });
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      console.log('Course Data:', this.courseForm.value);
    } else {
      Object.values(this.courseForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
