import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-pdf-content',
  imports: [SpkReusableTables, FormsModule, CommonModule, DragDropModule],
  templateUrl: './pdf-content.html',
  styleUrl: './pdf-content.scss'
})
export class PdfContent implements OnInit {
  categories: any[] = [];
  subcategories: any[] = [];
  subjects: any[] = [];
  courses: any[] = [];
  mentors: any[] = [];
  pdfs: any[] = [];

  selectedPdf: any = null;
  isUploading = false;
  searchTerm: string = '';

  // Add form fields
  categoryId: number | null = null;
  subcategoryId: number | null = null;
  subjectId: number | null = null;
  courseId: number | null = null;
  mentorId: number | null = null;
  lessonId: number | null = null;
  chapterId: number | null = null;
  topicId: number | null = null;
  pdfTitle: string = '';
  pdfPrice: number | null = null;
  pdfWalletPoints: number | null = null;
  pdfDescription: string = '';
  pdfFile: File | null = null;
  pdfFileName: string = '';
  samplePdfFile: File | null = null;
  samplePdfFileName: string = '';

  // Edit form fields
  editCategoryId: number | null = null;
  editSubcategoryId: number | null = null;
  editSubjectId: number | null = null;
  editCourseId: number | null = null;
  editMentorId: number | null = null;
  editLessonId: number | null = null;
  editChapterId: number | null = null;
  editTopicId: number | null = null;
  editPdfTitle: string = '';
  editPdfPrice: number | null = null;
  editPdfWalletPoints: number | null = null;
  editPdfDescription: string = '';
  editPdfFile: File | null = null;
  editPdfFileName: string = '';
  editSamplePdfFile: File | null = null;
  editSamplePdfFileName: string = '';

  // Cascading lists (Add form)
  filteredSubcategories: any[] = [];
  filteredSubjects: any[] = [];
  filteredCourses: any[] = [];
  lessonsList: any[] = [];
  chaptersList: any[] = [];
  topicsList: any[] = [];

  // Cascading lists (Edit form)
  editFilteredSubcategories: any[] = [];
  editFilteredSubjects: any[] = [];
  editFilteredCourses: any[] = [];
  editLessonsList: any[] = [];
  editChaptersList: any[] = [];
  editTopicsList: any[] = [];

  constructor(
    private modalService: NgbModal,
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastr.warning('Please log in first.', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadCategories();
    this.loadSubcategories();
    this.loadSubjects();
    this.loadCourses();
    this.loadMentors();
    this.loadPdfs();
  }

  get filteredPdfs(): any[] {
    if (!this.searchTerm.trim()) {
      return this.pdfs;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.pdfs.filter(pdf => {
      const title = (pdf.title || '').toLowerCase();
      const mentor = (pdf.mentor_name || '').toLowerCase();
      const course = (pdf.course_name || '').toLowerCase();
      const lesson = (pdf.lesson_title || '').toLowerCase();
      const chapter = (pdf.chapter_title || '').toLowerCase();
      const topic = (pdf.topic_title || '').toLowerCase();
      const desc = (pdf.description || '').toLowerCase();
      return title.includes(term) || mentor.includes(term) || course.includes(term) || 
             lesson.includes(term) || chapter.includes(term) || topic.includes(term) || 
             desc.includes(term);
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadCategories(): void {
    this.http.get<any>(`${environment.apiUrl}/category`).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadSubcategories(): void {
    this.http.get<any>(`${environment.apiUrl}/subcategory`).subscribe({
      next: (res) => {
        if (res.success) {
          this.subcategories = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading subcategories:', err)
    });
  }

  loadSubjects(): void {
    this.http.get<any>(`${environment.apiUrl}/subject`).subscribe({
      next: (res) => {
        if (res.success) {
          this.subjects = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading subjects:', err)
    });
  }

  loadCourses(): void {
    this.http.get<any>(`${environment.apiUrl}/course`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          this.courses = res.data;
        } else if (Array.isArray(res)) {
          this.courses = res;
        } else if (res && Array.isArray(res.data?.courses)) {
          this.courses = res.data.courses;
        } else if (res && Array.isArray(res.courses)) {
          this.courses = res.courses;
        } else if (res && res.data) {
          this.courses = Array.isArray(res.data) ? res.data : [];
        } else {
          this.courses = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading courses:', err)
    });
  }

  loadMentors(): void {
    this.http.get<any>(`${environment.apiUrl}/mentor`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.mentors = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading mentors:', err)
    });
  }

  loadPdfs(): void {
    this.http.get<any>(`${environment.apiUrl}/pdf`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.pdfs = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading PDFs:', err);
        this.toastr.error('Failed to load PDFs list', 'Error');
      }
    });
  }

  getCourseName(courseId: any): string {
    if (!courseId) return '-';
    const course = this.courses.find(c => Number(c.id) === Number(courseId));
    return course ? course.course_name : '-';
  }

  // Cascading dropdown logic (Add form)
  onCategoryChange(): void {
    this.subcategoryId = null;
    this.subjectId = null;
    this.courseId = null;
    this.filteredSubcategories = this.categoryId
      ? this.subcategories.filter(sub => Number(sub.category_id) === Number(this.categoryId))
      : [];
    this.filteredSubjects = [];
    this.filteredCourses = [];
    this.onCourseChange(null, false);
  }

  onSubcategoryChange(): void {
    this.subjectId = null;
    this.courseId = null;
    this.filteredSubjects = this.subcategoryId
      ? this.subjects.filter(sub => Number(sub.subcategory_id) === Number(this.subcategoryId))
      : [];
    this.filteredCourses = [];
    this.onCourseChange(null, false);
  }

  onSubjectChange(): void {
    this.courseId = null;
    this.filteredCourses = this.subjectId
      ? this.courses.filter(c => Number(c.subject_id) === Number(this.subjectId))
      : [];
    this.onCourseChange(null, false);
  }

  // Cascading dropdown logic (Edit form)
  onEditCategoryChange(): void {
    this.editSubcategoryId = null;
    this.editSubjectId = null;
    this.editCourseId = null;
    this.editFilteredSubcategories = this.editCategoryId
      ? this.subcategories.filter(sub => Number(sub.category_id) === Number(this.editCategoryId))
      : [];
    this.editFilteredSubjects = [];
    this.editFilteredCourses = [];
    this.onCourseChange(null, true);
  }

  onEditSubcategoryChange(): void {
    this.editSubjectId = null;
    this.editCourseId = null;
    this.editFilteredSubjects = this.editSubcategoryId
      ? this.subjects.filter(sub => Number(sub.subcategory_id) === Number(this.editSubcategoryId))
      : [];
    this.editFilteredCourses = [];
    this.onCourseChange(null, true);
  }

  onEditSubjectChange(): void {
    this.editCourseId = null;
    this.editFilteredCourses = this.editSubjectId
      ? this.courses.filter(c => Number(c.subject_id) === Number(this.editSubjectId))
      : [];
    this.onCourseChange(null, true);
  }

  // Fetch course structure for lessons, chapters, and topics
  onCourseChange(courseId: any, isEdit = false): void {
    if (!courseId || courseId === 'null' || courseId === 'undefined') {
      if (isEdit) {
        this.editLessonsList = [];
        this.editChaptersList = [];
        this.editTopicsList = [];
        this.editLessonId = null;
        this.editChapterId = null;
        this.editTopicId = null;
      } else {
        this.lessonsList = [];
        this.chaptersList = [];
        this.topicsList = [];
        this.lessonId = null;
        this.chapterId = null;
        this.topicId = null;
      }
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/course/${courseId}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (isEdit) {
            this.editLessonsList = res.data.lessons || [];
            this.editChaptersList = [];
            this.editTopicsList = [];
          } else {
            this.lessonsList = res.data.lessons || [];
            this.chaptersList = [];
            this.topicsList = [];
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching course structure:', err)
    });
  }

  onLessonChange(isEdit = false): void {
    if (isEdit) {
      this.editChapterId = null;
      this.editTopicId = null;
      const val: any = this.editLessonId;
      const parsedId = val === 'null' || val === 'undefined' ? null : val;
      const lesson = parsedId ? this.editLessonsList.find(l => Number(l.id) === Number(parsedId)) : null;
      this.editChaptersList = lesson ? lesson.chapters || [] : [];
      this.editTopicsList = [];
      if (!parsedId) this.editLessonId = null;
    } else {
      this.chapterId = null;
      this.topicId = null;
      const val: any = this.lessonId;
      const parsedId = val === 'null' || val === 'undefined' ? null : val;
      const lesson = parsedId ? this.lessonsList.find(l => Number(l.id) === Number(parsedId)) : null;
      this.chaptersList = lesson ? lesson.chapters || [] : [];
      this.topicsList = [];
      if (!parsedId) this.lessonId = null;
    }
  }

  onChapterChange(isEdit = false): void {
    if (isEdit) {
      this.editTopicId = null;
      const val: any = this.editChapterId;
      const parsedId = val === 'null' || val === 'undefined' ? null : val;
      const chapter = parsedId ? this.editChaptersList.find(c => Number(c.id) === Number(parsedId)) : null;
      this.editTopicsList = chapter ? chapter.topics || [] : [];
      if (!parsedId) this.editChapterId = null;
    } else {
      this.topicId = null;
      const val: any = this.chapterId;
      const parsedId = val === 'null' || val === 'undefined' ? null : val;
      const chapter = parsedId ? this.chaptersList.find(c => Number(c.id) === Number(parsedId)) : null;
      this.topicsList = chapter ? chapter.topics || [] : [];
      if (!parsedId) this.chapterId = null;
    }
  }

  open(content: any): void {
    // Reset add form fields
    this.categoryId = null;
    this.subcategoryId = null;
    this.subjectId = null;
    this.courseId = null;
    this.mentorId = null;
    this.lessonId = null;
    this.chapterId = null;
    this.topicId = null;
    this.pdfTitle = '';
    this.pdfPrice = null;
    this.pdfWalletPoints = null;
    this.pdfDescription = '';
    this.pdfFile = null;
    this.pdfFileName = '';
    this.samplePdfFile = null;
    this.samplePdfFileName = '';

    this.filteredSubcategories = [];
    this.filteredSubjects = [];
    this.filteredCourses = [];
    this.lessonsList = [];
    this.chaptersList = [];
    this.topicsList = [];

    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  onFileSelected(event: any, isEdit = false): void {
    const file = event.target.files[0];
    if (file) {
      if (isEdit) {
        this.editPdfFile = file;
        this.editPdfFileName = file.name;
      } else {
        this.pdfFile = file;
        this.pdfFileName = file.name;
      }
    }
  }

  onSampleFileSelected(event: any, isEdit = false): void {
    const file = event.target.files[0];
    if (file) {
      if (isEdit) {
        this.editSamplePdfFile = file;
        this.editSamplePdfFileName = file.name;
      } else {
        this.samplePdfFile = file;
        this.samplePdfFileName = file.name;
      }
    }
  }

  addPdf(modal: any): void {
    if (!this.pdfTitle.trim() || !this.pdfFile) {
      this.toastr.error('PDF Title and Main PDF File are required.', 'Validation Error');
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    formData.append('pdf_file', this.pdfFile);
    if (this.samplePdfFile) {
      formData.append('sample_pdf_file', this.samplePdfFile);
    }
    formData.append('title', this.pdfTitle.trim());
    formData.append('description', this.pdfDescription.trim());
    if (this.categoryId) formData.append('category_id', String(this.categoryId));
    if (this.subcategoryId) formData.append('subcategory_id', String(this.subcategoryId));
    if (this.subjectId) formData.append('subject_id', String(this.subjectId));
    if (this.courseId) formData.append('course_id', String(this.courseId));
    const priceVal = (this.pdfPrice !== null && this.pdfPrice !== undefined && this.pdfPrice !== ('' as any)) ? Number(this.pdfPrice) : 0;
    formData.append('price', String(priceVal));
    const walletPointsVal = (this.pdfWalletPoints !== null && this.pdfWalletPoints !== undefined && this.pdfWalletPoints !== ('' as any)) ? Number(this.pdfWalletPoints) : 0;
    formData.append('wallet_points', String(walletPointsVal));
    
    if (this.mentorId) formData.append('mentor_id', String(this.mentorId));
    if (this.lessonId) formData.append('lesson_id', String(this.lessonId));
    if (this.chapterId) formData.append('chapter_id', String(this.chapterId));
    if (this.topicId) formData.append('topic_id', String(this.topicId));

    this.http.post<any>(`${environment.apiUrl}/pdf/upload`, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success) {
          this.toastr.success('PDF content uploaded successfully', 'Success');
          this.loadPdfs();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to upload PDF', 'Error');
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error adding PDF:', err);
        this.toastr.error(err.error?.message || 'Server error while uploading PDF', 'Error');
      }
    });
  }

  openEdit(pdf: any, content: any): void {
    this.selectedPdf = pdf;

    // Find associated course to resolve category, subcategory, subject if not directly on pdf
    const matchedCourse = this.courses.find(c => Number(c.id) === Number(pdf.course_id));

    this.editCategoryId = pdf.category_id || (matchedCourse ? matchedCourse.category_id : null);

    this.editFilteredSubcategories = this.editCategoryId
      ? this.subcategories.filter(sub => Number(sub.category_id) === Number(this.editCategoryId))
      : [];
    this.editSubcategoryId = pdf.subcategory_id || (matchedCourse ? matchedCourse.subcategory_id : null);

    this.editFilteredSubjects = this.editSubcategoryId
      ? this.subjects.filter(sub => Number(sub.subcategory_id) === Number(this.editSubcategoryId))
      : [];
    this.editSubjectId = pdf.subject_id || (matchedCourse ? matchedCourse.subject_id : null);

    this.editFilteredCourses = this.editSubjectId
      ? this.courses.filter(c => Number(c.subject_id) === Number(this.editSubjectId))
      : (this.editCategoryId ? this.courses.filter(c => Number(c.category_id) === Number(this.editCategoryId)) : this.courses);

    this.editCourseId = pdf.course_id ? Number(pdf.course_id) : null;
    this.editMentorId = pdf.mentor_id ? Number(pdf.mentor_id) : null;
    this.editPdfTitle = pdf.title || '';
    this.editPdfPrice = (pdf.price != null && Number(pdf.price) !== 0) ? pdf.price : null;
    this.editPdfWalletPoints = (pdf.wallet_points != null && Number(pdf.wallet_points) !== 0) ? pdf.wallet_points : null;
    this.editPdfDescription = pdf.description || '';
    this.editPdfFile = null;
    this.editPdfFileName = pdf.pdf_file ? pdf.pdf_file.split('/').pop() : '';
    this.editSamplePdfFile = null;
    this.editSamplePdfFileName = pdf.sample_pdf_file ? pdf.sample_pdf_file.split('/').pop() : '';

    // Load full course details to populate lessons/chapters/topics
    if (this.editCourseId) {
      this.http.get<any>(`${environment.apiUrl}/course/${this.editCourseId}`, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.editLessonsList = res.data.lessons || [];
            this.editLessonId = pdf.lesson_id ? Number(pdf.lesson_id) : null;

            if (this.editLessonId) {
              const lesson = this.editLessonsList.find(l => Number(l.id) === Number(this.editLessonId));
              this.editChaptersList = lesson ? lesson.chapters || [] : [];
              this.editChapterId = pdf.chapter_id ? Number(pdf.chapter_id) : null;

              if (this.editChapterId) {
                const chapter = this.editChaptersList.find(c => Number(c.id) === Number(this.editChapterId));
                this.editTopicsList = chapter ? chapter.topics || [] : [];
                this.editTopicId = pdf.topic_id ? Number(pdf.topic_id) : null;
              } else {
                this.editTopicsList = [];
                this.editTopicId = null;
              }
            } else {
              this.editChaptersList = [];
              this.editTopicsList = [];
              this.editChapterId = null;
              this.editTopicId = null;
            }
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error fetching course structure for edit:', err)
      });
    } else {
      this.editLessonsList = [];
      this.editChaptersList = [];
      this.editTopicsList = [];
      this.editLessonId = null;
      this.editChapterId = null;
      this.editTopicId = null;
    }

    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  updatePdf(modal: any): void {
    if (!this.editPdfTitle.trim()) {
      this.toastr.error('PDF Title is required.', 'Validation Error');
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    if (this.editPdfFile) {
      formData.append('pdf_file', this.editPdfFile);
    }
    if (this.editSamplePdfFile) {
      formData.append('sample_pdf_file', this.editSamplePdfFile);
    }
    formData.append('title', this.editPdfTitle.trim());
    formData.append('description', this.editPdfDescription.trim());
    if (this.editCategoryId) formData.append('category_id', String(this.editCategoryId));
    if (this.editSubcategoryId) formData.append('subcategory_id', String(this.editSubcategoryId));
    if (this.editSubjectId) formData.append('subject_id', String(this.editSubjectId));
    if (this.editCourseId) {
      formData.append('course_id', String(this.editCourseId));
    }
    const editPriceVal = (this.editPdfPrice !== null && this.editPdfPrice !== undefined && this.editPdfPrice !== ('' as any)) ? Number(this.editPdfPrice) : 0;
    formData.append('price', String(editPriceVal));
    const editWalletPointsVal = (this.editPdfWalletPoints !== null && this.editPdfWalletPoints !== undefined && this.editPdfWalletPoints !== ('' as any)) ? Number(this.editPdfWalletPoints) : 0;
    formData.append('wallet_points', String(editWalletPointsVal));
    
    // Explicitly handle mapping or unmapping from curriculum level
    formData.append('mentor_id', this.editMentorId ? String(this.editMentorId) : 'null');
    formData.append('lesson_id', this.editLessonId ? String(this.editLessonId) : 'null');
    formData.append('chapter_id', this.editChapterId ? String(this.editChapterId) : 'null');
    formData.append('topic_id', this.editTopicId ? String(this.editTopicId) : 'null');

    this.http.put<any>(`${environment.apiUrl}/pdf/${this.selectedPdf.id}`, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success) {
          this.toastr.success('PDF content updated successfully', 'Success');
          this.loadPdfs();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update PDF', 'Error');
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error updating PDF:', err);
        this.toastr.error(err.error?.message || 'Server error while updating PDF', 'Error');
      }
    });
  }

  toggleStatus(pdf: any): void {
    const newStatus = pdf.status === 'active' ? 'inactive' : 'active';
    const formData = new FormData();
    formData.append('status', newStatus);

    this.http.put<any>(`${environment.apiUrl}/pdf/${pdf.id}`, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`PDF status updated to ${newStatus}`, 'Success');
          pdf.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status', 'Error');
          this.loadPdfs();
        }
      },
      error: (err) => {
        console.error('Error changing PDF status:', err);
        this.toastr.error('Error updating PDF status', 'Error');
        this.loadPdfs();
      }
    });
  }

  openDelete(pdf: any, content: any): void {
    this.selectedPdf = pdf;
    this.modalService.open(content, { centered: true });
  }

  deletePdf(id: number, modal: any): void {
    this.http.delete<any>(`${environment.apiUrl}/pdf/${id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('PDF deleted successfully', 'Success');
          this.loadPdfs();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete PDF', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting PDF:', err);
        this.toastr.error('Error deleting PDF', 'Error');
      }
    });
  }

  previewPdf(pdf: any): void {
    const headers = this.getHeaders();
    this.http.get(`${environment.apiUrl}/pdf/preview/${pdf.id}`, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Error previewing PDF:', err);
        this.toastr.error('Failed to preview PDF file.', 'Error');
      }
    });
  }

  downloadPdf(pdf: any): void {
    const headers = this.getHeaders();
    this.http.get(`${environment.apiUrl}/pdf/download/${pdf.id}`, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdf.pdf_file ? pdf.pdf_file.split('/').pop() || 'document.pdf' : 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading PDF:', err);
        this.toastr.error('Failed to download PDF file.', 'Error');
      }
    });
  }

  previewSamplePdf(pdf: any): void {
    const headers = this.getHeaders();
    this.http.get(`${environment.apiUrl}/pdf/preview-sample/${pdf.id}`, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Error previewing sample PDF:', err);
        this.toastr.error('Failed to preview sample PDF file.', 'Error');
      }
    });
  }

  downloadSamplePdf(pdf: any): void {
    const headers = this.getHeaders();
    this.http.get(`${environment.apiUrl}/pdf/download-sample/${pdf.id}`, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdf.sample_pdf_file ? pdf.sample_pdf_file.split('/').pop() || 'sample.pdf' : 'sample.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading sample PDF:', err);
        this.toastr.error('Failed to download sample PDF file.', 'Error');
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.pdfs, event.previousIndex, event.currentIndex);
    this.updatePdfOrder();
  }

  updatePdfOrder(): void {
    const order = this.pdfs.map(pdf => pdf.id);
    this.http.put<any>(`${environment.apiUrl}/pdf/reorder`, { order }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.toastr.success('PDF order updated successfully', 'Success');
        }
      },
      error: (err) => {
        console.warn('PDF reorder endpoint notice:', err);
      }
    });
  }
}