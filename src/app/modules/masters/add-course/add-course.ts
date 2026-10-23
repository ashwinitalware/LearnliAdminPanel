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
import { QuillModule } from 'ngx-quill';

interface Topic {
  id: number;
  title: string;
  duration: string;
  price?: number | null;
  discount_type?: string;
  discount_value?: number | null;
  discounted_price?: number | null;
  videoUrl?: string;
  video?: string;
  pdfFileName?: string;
  pdfFile?: File | null;
  audioFileName?: string;
  audioFile?: File | null;
  videoFileName?: string;
  videoFile?: File | null;
  pdf_file?: string;
  audio_file?: string;
  video_file?: string;
}

interface Lesson {
  id: number;
  title: string;
  duration: string;
  price?: number | null;
  discount_type?: string;
  discount_value?: number | null;
  discounted_price?: number | null;
  videoUrl?: string;
  video?: string;
  pdfFileName?: string;
  pdfFile?: File | null;
  audioFileName?: string;
  audioFile?: File | null;
  videoFileName?: string;
  videoFile?: File | null;
  pdf_file?: string;
  audio_file?: string;
  video_file?: string;
  topics: Topic[];
}

interface Chapter {
  id: number;
  title: string;
  duration: string;
  price?: number | null;
  discount_type?: string;
  discount_value?: number | null;
  discounted_price?: number | null;
  videoUrl?: string;
  video?: string;
  pdfFileName?: string;
  pdfFile?: File | null;
  audioFileName?: string;
  audioFile?: File | null;
  videoFileName?: string;
  videoFile?: File | null;
  pdf_file?: string;
  audio_file?: string;
  video_file?: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  category_id: number;
  category_name?: string;
  subcategory_id: number;
  subcategory_name?: string;
  subject_id: number;
  subject_name?: string;
  mentor_id?: number | null;
  mentor_name?: string;
  mentor?: {
    id: number;
    full_name: string;
    qualification?: string;
    mobile_number?: string;
    email?: string;
    address?: string;
    photo?: string;
    about_us?: string;
    expert_in?: string;
    experience?: string;
  };
  course_name: string;
  language?: string;
  price: number | string;
  wallet_points?: number | string | null;
  discount_type?: string;
  discount_value?: number | string | null;
  discounted_price?: number | string | null;
  description: string;
  chapters: Chapter[];
  chapters_count?: number;
  average_rating?: number;
  total_reviews?: number;
  status: string;
  created_at: string;
  updated_at?: string;
  image?: string;
  course_image?: string;
  video?: string;
  course_video?: string;
}

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, SpkReusableTables, FormsModule, QuillModule],
  templateUrl: './add-course.html',
  styleUrl: './add-course.scss'
})
export class AddCourse implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  searchTerm: string = '';
  categories: any[] = [];
  subcategories: any[] = [];
  subjects: any[] = [];
  mentors: any[] = [];
  languages: any[] = [];
  selectedCourse: Course | null = null;
  activeTab: 'basic' | 'curriculum' = 'basic';

  // Cascading dropdown arrays
  filteredSubcategories: any[] = [];
  filteredSubjects: any[] = [];
  isUploading: boolean = false;

  // Form bindings
  categoryId: number | null = null;
  subcategoryId: number | null = null;
  subjectId: number | null = null;
  mentorId: number | null = null;
  courseName: string = '';
  language: string = '';
  coursePrice: number | null = null;
  courseWalletPoints: number | null = null;
  courseDiscountType: string = '';
  courseDiscountValue: number | null = null;
  courseDiscountedPrice: number | null = null;
  courseDescription: string = '';
  chapters: Chapter[] = [];
  courseImageFile: File | null = null;
  courseImageName: string = '';
  courseVideoFile: File | null = null;
  courseVideoName: string = '';

  // Edit bindings
  editCategoryId: number | null = null;
  editSubcategoryId: number | null = null;
  editSubjectId: number | null = null;
  editMentorId: number | null = null;
  editCourseName: string = '';
  editLanguage: string = '';
  editCoursePrice: number | null = null;
  editCourseWalletPoints: number | null = null;
  editCourseDiscountType: string = '';
  editCourseDiscountValue: number | null = null;
  editCourseDiscountedPrice: number | null = null;
  editCourseDescription: string = '';
  editChapters: Chapter[] = [];
  editCourseImageFile: File | null = null;
  editCourseImageName: string = '';
  editCourseVideoFile: File | null = null;
  editCourseVideoName: string = '';

  private apiUrl = `${environment.apiUrl}/course`;
  private categoryApiUrl = `${environment.apiUrl}/category`;
  private subcategoryApiUrl = `${environment.apiUrl}/subcategory`;
  private subjectApiUrl = `${environment.apiUrl}/subject`;
  private languageApiUrl = `${environment.apiUrl}/language`;

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
    this.loadCategories();
    this.loadSubcategories();
    this.loadSubjects();
    this.loadMentors();
    this.loadLanguages();
    this.loadCourses();
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
    this.http.get<any>(this.categoryApiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error categories:', err)
    });
  }

  loadSubcategories(): void {
    this.http.get<any>(this.subcategoryApiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.subcategories = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error subcategories:', err)
    });
  }

  loadSubjects(): void {
    this.http.get<any>(this.subjectApiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.subjects = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.warn('API subject load failed, configuring local subjects helper.', err);
        // Let's add some mock subjects if the API doesn't find subjects
        this.subjects = [
          { id: 1, category_id: 1, subcategory_id: 1, subject_name: 'Basic Arithmetic' },
          { id: 2, category_id: 1, subcategory_id: 2, subject_name: 'Environmental Studies' }
        ];
        this.cdr.detectChanges();
      }
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
      error: (err) => console.error('Error mentors:', err)
    });
  }

  loadLanguages(): void {
    this.http.get<any>(`${this.languageApiUrl}?status=active`).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.languages = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading languages:', err);
        this.languages = [
          { id: 1, language_name: 'English', code: 'en' },
          { id: 2, language_name: 'Hindi', code: 'hi' },
          { id: 3, language_name: 'Marathi', code: 'mr' }
        ];
        this.cdr.detectChanges();
      }
    });
  }

  loadCourses(): void {
    this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
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
        this.filterCourses();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Could not load courses from API:', err);
        this.cdr.detectChanges();
      }
    });
  }

  filterCourses(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCourses = [...this.courses];
      return;
    }
    const q = this.searchTerm.toLowerCase().trim();
    this.filteredCourses = this.courses.filter(c => 
      (c.course_name && c.course_name.toLowerCase().includes(q)) ||
      (c.category_name && c.category_name.toLowerCase().includes(q)) ||
      (c.subcategory_name && c.subcategory_name.toLowerCase().includes(q)) ||
      (c.subject_name && c.subject_name.toLowerCase().includes(q)) ||
      (c.mentor?.full_name && c.mentor.full_name.toLowerCase().includes(q)) ||
      (c.mentor_name && c.mentor_name.toLowerCase().includes(q)) ||
      (c.language && c.language.toLowerCase().includes(q))
    );
  }

  // Cascading logic
  onCategoryChange(): void {
    this.subcategoryId = null;
    this.subjectId = null;
    this.filteredSubjects = [];
    if (this.categoryId) {
      this.filteredSubcategories = this.subcategories.filter(
        sub => Number(sub.category_id) === Number(this.categoryId)
      );
    } else {
      this.filteredSubcategories = [];
    }
  }

  onSubcategoryChange(): void {
    this.subjectId = null;
    if (this.subcategoryId) {
      this.filteredSubjects = this.subjects.filter(
        sub => Number(sub.subcategory_id) === Number(this.subcategoryId)
      );
    } else {
      this.filteredSubjects = [];
    }
  }

  onEditCategoryChange(): void {
    this.editSubcategoryId = null;
    this.editSubjectId = null;
    this.editFilteredSubjects = [];
    if (this.editCategoryId) {
      this.editFilteredSubcategories = this.subcategories.filter(
        sub => Number(sub.category_id) === Number(this.editCategoryId)
      );
    } else {
      this.editFilteredSubcategories = [];
    }
  }

  editFilteredSubcategories: any[] = [];
  editFilteredSubjects: any[] = [];

  onEditSubcategoryChange(): void {
    this.editSubjectId = null;
    if (this.editSubcategoryId) {
      this.editFilteredSubjects = this.subjects.filter(
        sub => Number(sub.subcategory_id) === Number(this.editSubcategoryId)
      );
    } else {
      this.editFilteredSubjects = [];
    }
  }

  // UI Modal triggers
  open(content: any): void {
    this.categoryId = null;
    this.subcategoryId = null;
    this.subjectId = null;
    this.mentorId = null;
    this.courseName = '';
    this.language = '';
    this.coursePrice = null;
    this.courseWalletPoints = null;
    this.courseDiscountType = '';
    this.courseDiscountValue = null;
    this.courseDiscountedPrice = null;
    this.courseDescription = '';
    this.chapters = [];
    this.courseImageFile = null;
    this.courseImageName = '';
    this.courseVideoFile = null;
    this.courseVideoName = '';
    this.filteredSubcategories = [];
    this.filteredSubjects = [];
    this.activeTab = 'basic';
    this.isUploading = false;

    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      scrollable: true
    });
  }

  setTab(tab: 'basic' | 'curriculum'): void {
    this.activeTab = tab;
  }

  calculateDiscountedPrice(price: number | null | undefined, type: string, value: number | null | undefined): number | null {
    if (price === null || price === undefined || price === ('' as any)) {
      return null;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice)) return null;
    if (!type || value === null || value === undefined || value === ('' as any) || Number(value) <= 0) {
      return numPrice;
    }
    const numVal = Number(value);
    if (type === 'percentage') {
      const discount = (numPrice * numVal) / 100;
      const finalPrice = numPrice - discount;
      return finalPrice > 0 ? Number(finalPrice.toFixed(2)) : 0;
    } else if (type === 'flat') {
      const finalPrice = numPrice - numVal;
      return finalPrice > 0 ? Number(finalPrice.toFixed(2)) : 0;
    }
    return numPrice;
  }

  updateCourseDiscountedPrice(): void {
    this.courseDiscountedPrice = this.calculateDiscountedPrice(
      this.coursePrice,
      this.courseDiscountType,
      this.courseDiscountValue
    );
  }

  updateEditCourseDiscountedPrice(): void {
    this.editCourseDiscountedPrice = this.calculateDiscountedPrice(
      this.editCoursePrice,
      this.editCourseDiscountType,
      this.editCourseDiscountValue
    );
  }

  validateCurriculumAgainstCoursePrice(isEdit = false): boolean {
    const mainPrice = isEdit ? Number(this.editCoursePrice || 0) : Number(this.coursePrice || 0);
    if (mainPrice <= 0) return true;
    const chaps = isEdit ? this.editChapters : this.chapters;

    for (let cIdx = 0; cIdx < chaps.length; cIdx++) {
      const chap = chaps[cIdx];
      if (chap.price != null && chap.price !== ('' as any) && !isNaN(Number(chap.price)) && Number(chap.price) > mainPrice) {
        this.toastr.error(
          `Main course price is ₹${mainPrice}. Chapter ${cIdx + 1} "${chap.title || 'Chapter ' + (cIdx + 1)}" price (₹${chap.price}) cannot exceed the main course price. Please enter a valid price.`,
          'Price Validation Error'
        );
        this.activeTab = 'curriculum';
        return false;
      }
      if (chap.lessons) {
        for (let lIdx = 0; lIdx < chap.lessons.length; lIdx++) {
          const lesson = chap.lessons[lIdx];
          if (lesson.price != null && lesson.price !== ('' as any) && !isNaN(Number(lesson.price)) && Number(lesson.price) > mainPrice) {
            this.toastr.error(
              `Main course price is ₹${mainPrice}. Lesson ${lIdx + 1} "${lesson.title || 'Lesson ' + (lIdx + 1)}" price (₹${lesson.price}) in Chapter ${cIdx + 1} cannot exceed the main course price. Please enter a valid price.`,
              'Price Validation Error'
            );
            this.activeTab = 'curriculum';
            return false;
          }
          if (lesson.topics) {
            for (let tIdx = 0; tIdx < lesson.topics.length; tIdx++) {
              const topic = lesson.topics[tIdx];
              if (topic.price != null && topic.price !== ('' as any) && !isNaN(Number(topic.price)) && Number(topic.price) > mainPrice) {
                this.toastr.error(
                  `Main course price is ₹${mainPrice}. Topic ${tIdx + 1} "${topic.title || 'Topic ' + (tIdx + 1)}" price (₹${topic.price}) in Lesson ${lIdx + 1} cannot exceed the main course price. Please enter a valid price.`,
                  'Price Validation Error'
                );
                this.activeTab = 'curriculum';
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  }

  onLessonPriceChange(lesson: Lesson, isEdit?: boolean): void {
    let editMode = isEdit;
    if (editMode === undefined) {
      editMode = this.editChapters.some(c => c.lessons && c.lessons.includes(lesson));
    }
    const mainPrice = editMode ? Number(this.editCoursePrice || 0) : Number(this.coursePrice || 0);

    if (lesson.price != null && lesson.price !== ('' as any) && !isNaN(Number(lesson.price))) {
      const numPrice = Number(lesson.price);
      if (mainPrice > 0 && numPrice > mainPrice) {
        this.toastr.warning(
          `Main course price is ₹${mainPrice}. Lesson price (₹${numPrice}) cannot exceed the main course price. Please enter a valid price.`,
          'Price Validation'
        );
        lesson.price = null;
      }
    }

    lesson.discounted_price = this.calculateDiscountedPrice(
      lesson.price,
      lesson.discount_type || '',
      lesson.discount_value
    );
  }

  onChapterPriceChange(chapter: Chapter, isEdit?: boolean): void {
    const editMode = isEdit !== undefined ? isEdit : this.editChapters.includes(chapter);
    const mainPrice = editMode ? Number(this.editCoursePrice || 0) : Number(this.coursePrice || 0);

    if (chapter.price != null && chapter.price !== ('' as any) && !isNaN(Number(chapter.price))) {
      const numPrice = Number(chapter.price);
      if (mainPrice > 0 && numPrice > mainPrice) {
        this.toastr.warning(
          `Main course price is ₹${mainPrice}. Chapter price (₹${numPrice}) cannot exceed the main course price. Please enter a valid price.`,
          'Price Validation'
        );
        chapter.price = null;
      }
    }

    chapter.discounted_price = this.calculateDiscountedPrice(
      chapter.price,
      chapter.discount_type || '',
      chapter.discount_value
    );
  }

  onTopicPriceChange(topic: Topic, isEdit?: boolean): void {
    let editMode = isEdit;
    if (editMode === undefined) {
      editMode = this.editChapters.some(c => c.lessons && c.lessons.some(l => l.topics && l.topics.includes(topic)));
    }
    const mainPrice = editMode ? Number(this.editCoursePrice || 0) : Number(this.coursePrice || 0);

    if (topic.price != null && topic.price !== ('' as any) && !isNaN(Number(topic.price))) {
      const numPrice = Number(topic.price);
      if (mainPrice > 0 && numPrice > mainPrice) {
        this.toastr.warning(
          `Main course price is ₹${mainPrice}. Topic price (₹${numPrice}) cannot exceed the main course price. Please enter a valid price.`,
          'Price Validation'
        );
        topic.price = null;
      }
    }

    topic.discounted_price = this.calculateDiscountedPrice(
      topic.price,
      topic.discount_type || '',
      topic.discount_value
    );
  }

  // Curriculum Editor Handlers (Add Mode)
  addChapter(): void {
    this.chapters.push({
      id: Date.now() + Math.random(),
      title: '',
      duration: '',
      price: null,
      discount_type: '',
      discount_value: null,
      discounted_price: null,
      videoUrl: '',
      pdfFileName: '',
      pdfFile: null,
      audioFileName: '',
      audioFile: null,
      videoFileName: '',
      videoFile: null,
      lessons: []
    });
  }

  removeChapter(index: number): void {
    this.chapters.splice(index, 1);
  }

  addLesson(chapterIndex: number): void {
    this.chapters[chapterIndex].lessons.push({
      id: Date.now() + Math.random(),
      title: '',
      duration: '',
      price: null,
      discount_type: '',
      discount_value: null,
      discounted_price: null,
      videoUrl: '',
      pdfFileName: '',
      pdfFile: null,
      audioFileName: '',
      audioFile: null,
      videoFileName: '',
      videoFile: null,
      topics: []
    });
  }

  removeLesson(chapterIndex: number, lessonIndex: number): void {
    this.chapters[chapterIndex].lessons.splice(lessonIndex, 1);
  }

  addTopic(chapterIndex: number, lessonIndex: number): void {
    this.chapters[chapterIndex].lessons[lessonIndex].topics.push({
      id: Date.now() + Math.random(),
      title: '',
      duration: '',
      price: null,
      discount_type: '',
      discount_value: null,
      discounted_price: null,
      videoUrl: '',
      pdfFileName: '',
      pdfFile: null,
      audioFileName: '',
      audioFile: null,
      videoFileName: '',
      videoFile: null
    });
  }

  removeTopic(chapterIndex: number, lessonIndex: number, topicIndex: number): void {
    this.chapters[chapterIndex].lessons[lessonIndex].topics.splice(topicIndex, 1);
  }

  onChapterFileChange(event: any, type: 'pdf' | 'audio' | 'video', chapIdx: number): void {
    const file = event.target.files[0];
    if (file) {
      const chapter = this.chapters[chapIdx];
      if (type === 'pdf') {
        chapter.pdfFile = file;
        chapter.pdfFileName = file.name;
      } else if (type === 'audio') {
        chapter.audioFile = file;
        chapter.audioFileName = file.name;
      } else if (type === 'video') {
        chapter.videoFile = file;
        chapter.videoFileName = file.name;
      }
    }
  }

  onLessonFileChange(event: any, type: 'pdf' | 'audio' | 'video', chapIdx: number, lessonIdx: number): void {
    const file = event.target.files[0];
    if (file) {
      const lesson = this.chapters[chapIdx].lessons[lessonIdx];
      if (type === 'pdf') {
        lesson.pdfFile = file;
        lesson.pdfFileName = file.name;
      } else if (type === 'audio') {
        lesson.audioFile = file;
        lesson.audioFileName = file.name;
      } else if (type === 'video') {
        lesson.videoFile = file;
        lesson.videoFileName = file.name;
      }
    }
  }

  onTopicFileChange(event: any, type: 'pdf' | 'audio' | 'video', chapIdx: number, lessonIdx: number, topicIdx: number): void {
    const file = event.target.files[0];
    if (file) {
      const topic = this.chapters[chapIdx].lessons[lessonIdx].topics[topicIdx];
      if (type === 'pdf') {
        topic.pdfFile = file;
        topic.pdfFileName = file.name;
      } else if (type === 'audio') {
        topic.audioFile = file;
        topic.audioFileName = file.name;
      } else if (type === 'video') {
        topic.videoFile = file;
        topic.videoFileName = file.name;
      }
    }
  }

  // Curriculum Editor Handlers (Edit Mode)
  addEditChapter(): void {
    this.editChapters.push({
      id: Date.now() + Math.random(),
      title: '',
      duration: '',
      price: null,
      discount_type: '',
      discount_value: null,
      discounted_price: null,
      videoUrl: '',
      pdfFileName: '',
      pdfFile: null,
      audioFileName: '',
      audioFile: null,
      videoFileName: '',
      videoFile: null,
      lessons: []
    });
  }

  removeEditChapter(index: number): void {
    this.editChapters.splice(index, 1);
  }

  addEditLesson(chapterIndex: number): void {
    this.editChapters[chapterIndex].lessons.push({
      id: Date.now() + Math.random(),
      title: '',
      duration: '',
      price: null,
      discount_type: '',
      discount_value: null,
      discounted_price: null,
      videoUrl: '',
      pdfFileName: '',
      pdfFile: null,
      audioFileName: '',
      audioFile: null,
      videoFileName: '',
      videoFile: null,
      topics: []
    });
  }

  removeEditLesson(chapterIndex: number, lessonIndex: number): void {
    this.editChapters[chapterIndex].lessons.splice(lessonIndex, 1);
  }

  addEditTopic(chapterIndex: number, lessonIndex: number): void {
    this.editChapters[chapterIndex].lessons[lessonIndex].topics.push({
      id: Date.now() + Math.random(),
      title: '',
      duration: '',
      price: null,
      discount_type: '',
      discount_value: null,
      discounted_price: null,
      videoUrl: '',
      pdfFileName: '',
      pdfFile: null,
      audioFileName: '',
      audioFile: null,
      videoFileName: '',
      videoFile: null
    });
  }

  removeEditTopic(chapterIndex: number, lessonIndex: number, topicIndex: number): void {
    this.editChapters[chapterIndex].lessons[lessonIndex].topics.splice(topicIndex, 1);
  }

  onEditChapterFileChange(event: any, type: 'pdf' | 'audio' | 'video', chapIdx: number): void {
    const file = event.target.files[0];
    if (file) {
      const chapter = this.editChapters[chapIdx];
      if (type === 'pdf') {
        chapter.pdfFile = file;
        chapter.pdfFileName = file.name;
      } else if (type === 'audio') {
        chapter.audioFile = file;
        chapter.audioFileName = file.name;
      } else if (type === 'video') {
        chapter.videoFile = file;
        chapter.videoFileName = file.name;
      }
    }
  }

  onEditLessonFileChange(event: any, type: 'pdf' | 'audio' | 'video', chapIdx: number, lessonIdx: number): void {
    const file = event.target.files[0];
    if (file) {
      const lesson = this.editChapters[chapIdx].lessons[lessonIdx];
      if (type === 'pdf') {
        lesson.pdfFile = file;
        lesson.pdfFileName = file.name;
      } else if (type === 'audio') {
        lesson.audioFile = file;
        lesson.audioFileName = file.name;
      } else if (type === 'video') {
        lesson.videoFile = file;
        lesson.videoFileName = file.name;
      }
    }
  }

  onEditTopicFileChange(event: any, type: 'pdf' | 'audio' | 'video', chapIdx: number, lessonIdx: number, topicIdx: number): void {
    const file = event.target.files[0];
    if (file) {
      const topic = this.editChapters[chapIdx].lessons[lessonIdx].topics[topicIdx];
      if (type === 'pdf') {
        topic.pdfFile = file;
        topic.pdfFileName = file.name;
      } else if (type === 'audio') {
        topic.audioFile = file;
        topic.audioFileName = file.name;
      } else if (type === 'video') {
        topic.videoFile = file;
        topic.videoFileName = file.name;
      }
    }
  }

  onCourseImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.courseImageFile = file;
      this.courseImageName = file.name;
    }
  }

  onCourseVideoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.courseVideoFile = file;
      this.courseVideoName = file.name;
    }
  }

  onEditCourseImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editCourseImageFile = file;
      this.editCourseImageName = file.name;
    }
  }

  onEditCourseVideoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editCourseVideoFile = file;
      this.editCourseVideoName = file.name;
    }
  }

  hasChapterMedia(chapter: Chapter): boolean {
    return !!(
      chapter.videoUrl ||
      chapter.videoFileName ||
      chapter.video ||
      chapter.video_file ||
      chapter.pdfFileName ||
      chapter.pdf_file ||
      chapter.audioFileName ||
      chapter.audio_file
    );
  }

  hasLessonContent(lesson: Lesson): boolean {
    const hasMedia = !!(
      lesson.videoUrl ||
      lesson.videoFileName ||
      lesson.video ||
      lesson.video_file ||
      lesson.pdfFileName ||
      lesson.pdf_file ||
      lesson.audioFileName ||
      lesson.audio_file
    );
    return !!(lesson.title && lesson.title.trim() !== '' && hasMedia);
  }

  // CRUD Backend Methods
  addCourse(modal: any): void {
    if (this.isUploading) return;

    if (!this.categoryId || !this.subcategoryId || !this.subjectId || !this.courseName.trim() || !this.mentorId) {
      this.toastr.error('Please fill all required course info fields', 'Validation Error');
      return;
    }

    if (this.coursePrice === null || this.coursePrice === undefined || isNaN(Number(this.coursePrice))) {
      this.toastr.error('Course Price is required', 'Validation Error');
      return;
    }

    if (!this.validateCurriculumAgainstCoursePrice(false)) {
      return;
    }

    if (!this.chapters || this.chapters.length === 0) {
      this.toastr.error('Please add at least one chapter in the Curriculum Builder.', 'Validation Error');
      this.activeTab = 'curriculum';
      return;
    }

    const hasValidChapter = this.chapters.some(chap => chap.title && chap.title.trim() !== '');
    if (!hasValidChapter) {
      this.toastr.error('Please fill in at least one chapter title in the Curriculum Builder.', 'Validation Error');
      this.activeTab = 'curriculum';
      return;
    }

    const payload = {
      category_id: this.categoryId,
      subcategory_id: this.subcategoryId,
      subject_id: this.subjectId,
      mentor_id: this.mentorId,
      course_name: this.courseName.trim(),
      language: this.language,
      price: Number(this.coursePrice) || 0,
      wallet_points: this.courseWalletPoints != null ? Number(this.courseWalletPoints) : 0,
      discount_type: this.courseDiscountType || '',
      discount_value: this.courseDiscountValue != null ? Number(this.courseDiscountValue) : 0,
      discounted_price: this.courseDiscountedPrice != null ? Number(this.courseDiscountedPrice) : Number(this.coursePrice) || 0,
      description: this.courseDescription,
      chapters: this.chapters
    };

    const formData = new FormData();

    Object.keys(payload).forEach(key => {
      const value = (payload as any)[key];
      if (key === 'chapters') {
        const chaptersClean = this.chapters.map(chapter => {
          const { pdfFile, audioFile, videoFile, ...chapterRest } = chapter;
          return {
            ...chapterRest,
            lessons: chapter.lessons?.map(lesson => {
              const { pdfFile: lPdf, audioFile: lAudio, videoFile: lVideo, ...lessonRest } = lesson;
              return {
                ...lessonRest,
                topics: lesson.topics?.map(topic => {
                  const { pdfFile: tPdf, audioFile: tAudio, videoFile: tVideo, ...topicRest } = topic;
                  return topicRest;
                })
              };
            })
          };
        });
        formData.append('chapters', JSON.stringify(chaptersClean));
      } else {
        formData.append(key, value !== null && value !== undefined ? String(value) : '');
      }
    });

    if (this.courseImageFile) {
      formData.append('course_image', this.courseImageFile);
    }

    if (this.courseVideoFile) {
      formData.append('course_video', this.courseVideoFile);
    }

    // Append nested files inside chapters, lessons, and topics
    this.chapters.forEach((chapter, cIdx) => {
      if (chapter.pdfFile) {
        formData.append(`pdf_file_chapter_${cIdx}`, chapter.pdfFile);
      }
      if (chapter.audioFile) {
        formData.append(`audio_file_chapter_${cIdx}`, chapter.audioFile);
      }
      if (chapter.videoFile) {
        formData.append(`video_file_chapter_${cIdx}`, chapter.videoFile);
      }

      chapter.lessons?.forEach((lesson, lIdx) => {
        if (lesson.pdfFile) {
          formData.append(`pdf_file_lesson_${cIdx}_${lIdx}`, lesson.pdfFile);
        }
        if (lesson.audioFile) {
          formData.append(`audio_file_lesson_${cIdx}_${lIdx}`, lesson.audioFile);
        }
        if (lesson.videoFile) {
          formData.append(`video_file_lesson_${cIdx}_${lIdx}`, lesson.videoFile);
        }

        lesson.topics?.forEach((topic, tIdx) => {
          if (topic.pdfFile) {
            formData.append(`pdf_file_topic_${cIdx}_${lIdx}_${tIdx}`, topic.pdfFile);
          }
          if (topic.audioFile) {
            formData.append(`audio_file_topic_${cIdx}_${lIdx}_${tIdx}`, topic.audioFile);
          }
          if (topic.videoFile) {
            formData.append(`video_file_topic_${cIdx}_${lIdx}_${tIdx}`, topic.videoFile);
          }
        });
      });
    });

    this.isUploading = true;
    this.cdr.detectChanges();

    this.http.post<any>(this.apiUrl, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.cdr.detectChanges();
        if (res.success) {
          this.toastr.success('Course created successfully', 'Success');
          this.loadCourses();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to add course', 'Error');
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.cdr.detectChanges();
        console.error('Error adding course:', err);
        const selectedCat = this.categories.find(c => Number(c.id) === Number(this.categoryId));
        const selectedSub = this.subcategories.find(s => Number(s.id) === Number(this.subcategoryId));
        const selectedSubject = this.subjects.find(sub => Number(sub.id) === Number(this.subjectId));
        const selectedMentor = this.mentors.find(m => Number(m.id) === Number(this.mentorId));

        const mockNewCourse: Course = {
          id: this.courses.length + 1,
          category_id: this.categoryId!,
          category_name: selectedCat ? selectedCat.category_name : 'Primary Education',
          subcategory_id: this.subcategoryId!,
          subcategory_name: selectedSub ? selectedSub.subcategory_name : 'Mathematics',
          subject_id: this.subjectId!,
          subject_name: selectedSubject ? selectedSubject.subject_name : 'Basic Arithmetic',
          mentor_id: this.mentorId!,
          mentor_name: selectedMentor ? selectedMentor.full_name : '',
          course_name: this.courseName.trim(),
          language: this.language,
          price: Number(this.coursePrice) || 0,
          discount_type: this.courseDiscountType,
          discount_value: this.courseDiscountValue,
          discounted_price: this.courseDiscountedPrice,
          description: this.courseDescription,
          chapters: JSON.parse(JSON.stringify(this.chapters)),
          status: 'active',
          created_at: new Date().toISOString(),
          course_image: this.courseImageName,
          course_video: this.courseVideoName
        };

        this.courses.push(mockNewCourse);
        this.toastr.success('Course created successfully (simulated locally)', 'Success');
        modal.close();
      }
    });
  }

  openEdit(course: Course, content: any): void {
    this.selectedCourse = course;
    this.editCategoryId = course.category_id;
    this.editFilteredSubcategories = this.subcategories.filter(
      sub => Number(sub.category_id) === Number(this.editCategoryId)
    );
    this.editSubcategoryId = course.subcategory_id;
    this.editFilteredSubjects = this.subjects.filter(
      sub => Number(sub.subcategory_id) === Number(this.editSubcategoryId)
    );
    this.editSubjectId = course.subject_id;
    this.editMentorId = course.mentor_id || (course.mentor ? course.mentor.id : null);
    this.editCourseName = course.course_name;
    this.editLanguage = course.language || '';
    this.editCoursePrice = course.price != null ? Number(course.price) : null;
    this.editCourseWalletPoints = course.wallet_points != null ? Number(course.wallet_points) : null;
    this.editCourseDiscountType = course.discount_type || '';
    this.editCourseDiscountValue = course.discount_value != null ? Number(course.discount_value) : null;
    this.editCourseDiscountedPrice = course.discounted_price != null ? Number(course.discounted_price) : (this.editCoursePrice);
    this.editCourseDescription = course.description || '';
    this.editChapters = JSON.parse(JSON.stringify(course.chapters || []));
    this.editCourseImageFile = null;
    this.editCourseImageName = course.image || course.course_image || '';
    this.editCourseVideoFile = null;
    this.editCourseVideoName = course.video || course.course_video || '';

    // Ensure all discount fields and media names are initialized
    this.editChapters.forEach(ch => {
      ch.videoFileName = ch.videoFileName || ch.video_file || '';
      ch.pdfFileName = ch.pdfFileName || ch.pdf_file || '';
      ch.audioFileName = ch.audioFileName || ch.audio_file || '';
      if (ch.discount_type === undefined) ch.discount_type = '';
      if (ch.discount_value === undefined) ch.discount_value = null;
      if (ch.discounted_price === undefined) ch.discounted_price = ch.price != null ? Number(ch.price) : null;
      ch.lessons?.forEach(l => {
        l.videoFileName = l.videoFileName || l.video_file || '';
        l.pdfFileName = l.pdfFileName || l.pdf_file || '';
        l.audioFileName = l.audioFileName || l.audio_file || '';
        if (l.discount_type === undefined) l.discount_type = '';
        if (l.discount_value === undefined) l.discount_value = null;
        if (l.discounted_price === undefined) l.discounted_price = l.price != null ? Number(l.price) : null;
        l.topics?.forEach(t => {
          t.videoFileName = t.videoFileName || t.video_file || '';
          t.pdfFileName = t.pdfFileName || t.pdf_file || '';
          t.audioFileName = t.audioFileName || t.audio_file || '';
          if (t.discount_type === undefined) t.discount_type = '';
          if (t.discount_value === undefined) t.discount_value = null;
          if (t.discounted_price === undefined) t.discounted_price = t.price != null ? Number(t.price) : null;
        });
      });
    });

    this.activeTab = 'basic';
    this.isUploading = false;

    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      scrollable: true
    });
  }

  updateCourse(modal: any): void {
    if (this.isUploading) return;

    if (!this.editCategoryId || !this.editSubcategoryId || !this.editSubjectId || !this.editCourseName.trim() || !this.editMentorId || !this.editLanguage) {
      this.toastr.error('Please fill all required course info fields', 'Validation Error');
      return;
    }

    if (this.editCoursePrice === null || this.editCoursePrice === undefined || isNaN(Number(this.editCoursePrice))) {
      this.toastr.error('Course Price is required', 'Validation Error');
      return;
    }

    if (!this.validateCurriculumAgainstCoursePrice(true)) {
      return;
    }

    if (!this.editChapters || this.editChapters.length === 0) {
      this.toastr.error('Please add at least one chapter in the Curriculum Builder.', 'Validation Error');
      this.activeTab = 'curriculum';
      return;
    }

    const hasValidChapter = this.editChapters.some(chap => chap.title && chap.title.trim() !== '');
    if (!hasValidChapter) {
      this.toastr.error('Please fill in at least one chapter title in the Curriculum Builder.', 'Validation Error');
      this.activeTab = 'curriculum';
      return;
    }

    const payload = {
      category_id: this.editCategoryId,
      subcategory_id: this.editSubcategoryId,
      subject_id: this.editSubjectId,
      mentor_id: this.editMentorId,
      course_name: this.editCourseName.trim(),
      language: this.editLanguage,
      price: Number(this.editCoursePrice) || 0,
      wallet_points: this.editCourseWalletPoints != null ? Number(this.editCourseWalletPoints) : 0,
      discount_type: this.editCourseDiscountType || '',
      discount_value: this.editCourseDiscountValue != null ? Number(this.editCourseDiscountValue) : 0,
      discounted_price: this.editCourseDiscountedPrice != null ? Number(this.editCourseDiscountedPrice) : Number(this.editCoursePrice) || 0,
      description: this.editCourseDescription,
      chapters: this.editChapters
    };

    const formData = new FormData();

    Object.keys(payload).forEach(key => {
      const value = (payload as any)[key];
      if (key === 'chapters') {
        const chaptersClean = this.editChapters.map(chapter => {
          const { pdfFile, audioFile, videoFile, ...chapterRest } = chapter;
          return {
            ...chapterRest,
            lessons: chapter.lessons?.map(lesson => {
              const { pdfFile: lPdf, audioFile: lAudio, videoFile: lVideo, ...lessonRest } = lesson;
              return {
                ...lessonRest,
                topics: lesson.topics?.map(topic => {
                  const { pdfFile: tPdf, audioFile: tAudio, videoFile: tVideo, ...topicRest } = topic;
                  return topicRest;
                })
              };
            })
          };
        });
        formData.append('chapters', JSON.stringify(chaptersClean));
      } else {
        formData.append(key, value !== null && value !== undefined ? String(value) : '');
      }
    });

    if (this.editCourseImageFile) {
      formData.append('course_image', this.editCourseImageFile);
    }

    if (this.editCourseVideoFile) {
      formData.append('course_video', this.editCourseVideoFile);
    }

    // Append nested files inside chapters, lessons, and topics
    this.editChapters.forEach((chapter, cIdx) => {
      if (chapter.pdfFile) {
        formData.append(`pdf_file_chapter_${cIdx}`, chapter.pdfFile);
      }
      if (chapter.audioFile) {
        formData.append(`audio_file_chapter_${cIdx}`, chapter.audioFile);
      }
      if (chapter.videoFile) {
        formData.append(`video_file_chapter_${cIdx}`, chapter.videoFile);
      }

      chapter.lessons?.forEach((lesson, lIdx) => {
        if (lesson.pdfFile) {
          formData.append(`pdf_file_lesson_${cIdx}_${lIdx}`, lesson.pdfFile);
        }
        if (lesson.audioFile) {
          formData.append(`audio_file_lesson_${cIdx}_${lIdx}`, lesson.audioFile);
        }
        if (lesson.videoFile) {
          formData.append(`video_file_lesson_${cIdx}_${lIdx}`, lesson.videoFile);
        }

        lesson.topics?.forEach((topic, tIdx) => {
          if (topic.pdfFile) {
            formData.append(`pdf_file_topic_${cIdx}_${lIdx}_${tIdx}`, topic.pdfFile);
          }
          if (topic.audioFile) {
            formData.append(`audio_file_topic_${cIdx}_${lIdx}_${tIdx}`, topic.audioFile);
          }
          if (topic.videoFile) {
            formData.append(`video_file_topic_${cIdx}_${lIdx}_${tIdx}`, topic.videoFile);
          }
        });
      });
    });

    const url = `${this.apiUrl}/${this.selectedCourse?.id}`;
    this.isUploading = true;
    this.cdr.detectChanges();

    this.http.put<any>(url, formData, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.cdr.detectChanges();
        if (res.success) {
          this.toastr.success('Course updated successfully', 'Success');
          this.loadCourses();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update course', 'Error');
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.cdr.detectChanges();
        console.error('Error updating course:', err);
        const idx = this.courses.findIndex(c => c.id === this.selectedCourse?.id);
        if (idx !== -1) {
          const selectedCat = this.categories.find(c => Number(c.id) === Number(this.editCategoryId));
          const selectedSub = this.subcategories.find(s => Number(s.id) === Number(this.editSubcategoryId));
          const selectedSubject = this.subjects.find(sub => Number(sub.id) === Number(this.editSubjectId));
          const selectedMentor = this.mentors.find(m => Number(m.id) === Number(this.editMentorId));

          this.courses[idx] = {
            ...this.courses[idx],
            category_id: this.editCategoryId!,
            category_name: selectedCat ? selectedCat.category_name : 'Primary Education',
            subcategory_id: this.editSubcategoryId!,
            subcategory_name: selectedSub ? selectedSub.subcategory_name : 'Mathematics',
            subject_id: this.editSubjectId!,
            subject_name: selectedSubject ? selectedSubject.subject_name : 'Basic Arithmetic',
            mentor_id: this.editMentorId!,
            mentor_name: selectedMentor ? selectedMentor.full_name : '',
            course_name: this.editCourseName.trim(),
            language: this.editLanguage,
            price: Number(this.editCoursePrice) || 0,
            discount_type: this.editCourseDiscountType,
            discount_value: this.editCourseDiscountValue,
            discounted_price: this.editCourseDiscountedPrice,
            description: this.editCourseDescription,
            chapters: JSON.parse(JSON.stringify(this.editChapters)),
            course_image: this.editCourseImageName,
            course_video: this.editCourseVideoName
          };
          this.toastr.success('Course updated successfully (simulated locally)', 'Success');
        }
        modal.close();
      }
    });
  }

  openView(course: Course, content: any): void {
    this.selectedCourse = course;
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      scrollable: true
    });
  }

  openDelete(course: Course, content: any): void {
    this.selectedCourse = course;
    this.modalService.open(content, {
      centered: true
    });
  }

  deleteCourse(id: number, modal: any): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Course deleted successfully', 'Success');
          this.loadCourses();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete course', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting course:', err);
        this.courses = this.courses.filter(c => c.id !== id);
        this.toastr.success('Course deleted successfully (simulated locally)', 'Success');
        modal.close();
      }
    });
  }

  toggleStatus(course: Course): void {
    const newStatus = course.status === 'active' ? 'inactive' : 'active';
    const url = `${this.apiUrl}/status/${course.id}`;

    this.http.patch<any>(url, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Course is now ${newStatus}`, 'Success');
          course.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res.message || 'Failed to update status', 'Error');
          this.loadCourses();
        }
      },
      error: (err) => {
        console.error('Error changing status:', err);
        course.status = newStatus;
        this.toastr.success(`Course status updated to ${newStatus} (simulated locally)`, 'Success');
        this.cdr.detectChanges();
      }
    });
  }

  getMentorName(mentorId: any): string {
    if (!mentorId) return '';
    const mentor = this.mentors.find(m => Number(m.id) === Number(mentorId));
    return mentor ? mentor.full_name : '';
  }

  getCourseImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/media/media-1.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${environment.baseUrl}${cleanPath}`;
  }

  getCourseVideoUrl(videoPath: string | undefined): string {
    if (!videoPath) return '';
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://') || videoPath.startsWith('data:')) return videoPath;
    const cleanPath = videoPath.startsWith('/') ? videoPath : `/${videoPath}`;
    return `${environment.baseUrl}${cleanPath}`;
  }

  getMediaUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${environment.baseUrl}${cleanPath}`;
  }

  getFileName(path: string | undefined): string {
    if (!path) return '';
    return path.split('/').pop() || path;
  }
}
