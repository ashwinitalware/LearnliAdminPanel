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
  selector: 'app-add-quiz',
  imports: [SpkReusableTables, FormsModule, CommonModule, DragDropModule],
  templateUrl: './add-quiz.html',
  styleUrl: './add-quiz.scss'
})
export class AddQuiz implements OnInit {
  activeTab: 'quizzes' | 'results' = 'quizzes';
  searchQuizQuery: string = '';
  searchResultQuery: string = '';

  // Core master arrays
  categories: any[] = [];
  subcategories: any[] = [];
  subjects: any[] = [];
  courses: any[] = [];
  mentors: any[] = [];
  quizzes: any[] = [];
  quizResults: any[] = [];

  // Dropdown cascades (Add/Edit Form)
  filteredSubcategories: any[] = [];
  filteredSubjects: any[] = [];
  filteredCourses: any[] = [];
  lessonsList: any[] = [];
  chaptersList: any[] = [];
  topicsList: any[] = [];

  // Modal / Form state
  isEdit = false;
  isSaving = false;
  selectedQuiz: any = null;
  selectedAttempt: any = null;
  viewingQuiz: any = null;

  // Form Fields
  categoryId: number | null = null;
  subcategoryId: number | null = null;
  subjectId: number | null = null;
  courseId: number | null = null;
  mentorId: number | null = null;
  lessonId: number | null = null;
  chapterId: number | null = null;
  topicId: number | null = null;
  quizTitle: string = '';
  quizDescription: string = '';
  quizPrice: number = 0;
  quizStatus: string = 'active';
  displayOrder: number = 1;

  // Question Management Fields (inside the Quiz Modal)
  questions: any[] = [];
  isEditingQuestion = false;
  editingQuestionIndex = -1;
  qText: string = '';
  qOptA: string = '';
  qOptB: string = '';
  qOptC: string = '';
  qOptD: string = '';
  qCorrect: 'A' | 'B' | 'C' | 'D' | null = null;

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
    this.loadQuizzes();
    this.loadQuizResults();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  setTab(tab: 'quizzes' | 'results'): void {
    this.activeTab = tab;
    if (tab === 'quizzes') {
      this.loadQuizzes();
    } else {
      this.loadQuizResults();
    }
  }

  // API Loaders
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

  loadQuizzes(): void {
    this.http.get<any>(`${environment.apiUrl}/quiz`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.quizzes = res.data || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading quizzes:', err);
        this.toastr.error('Failed to load quizzes list', 'Error');
      }
    });
  }

  loadQuizResults(): void {
    this.http.get<any>(`${environment.apiUrl}/quiz-results`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.quizResults = res.data || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading quiz results:', err);
        this.toastr.error('Failed to load quiz attempt results', 'Error');
      }
    });
  }

  getCourseName(courseId: any): string {
    if (!courseId) return '-';
    const course = this.courses.find(c => Number(c.id) === Number(courseId));
    return course ? course.course_name : '-';
  }

  // Dropdown cascade logic (Add/Edit Form)
  onCategoryChange(): void {
    this.subcategoryId = null;
    this.subjectId = null;
    this.courseId = null;
    this.filteredSubcategories = this.categoryId
      ? this.subcategories.filter(sub => Number(sub.category_id) === Number(this.categoryId))
      : [];
    this.filteredSubjects = [];
    this.filteredCourses = [];
    this.onCourseChange(null);
  }

  onSubcategoryChange(): void {
    this.subjectId = null;
    this.courseId = null;
    this.filteredSubjects = this.subcategoryId
      ? this.subjects.filter(sub => Number(sub.subcategory_id) === Number(this.subcategoryId))
      : [];
    this.filteredCourses = [];
    this.onCourseChange(null);
  }

  onSubjectChange(): void {
    this.courseId = null;
    this.filteredCourses = this.subjectId
      ? this.courses.filter(c => Number(c.subject_id) === Number(this.subjectId))
      : [];
    this.onCourseChange(null);
  }

  onCourseChange(courseId: any, resetSelections = true): void {
    if (!courseId) {
      this.lessonsList = [];
      this.chaptersList = [];
      this.topicsList = [];
      if (resetSelections) {
        this.lessonId = null;
        this.chapterId = null;
        this.topicId = null;
      }
      return;
    }

    if (resetSelections) {
      this.lessonId = null;
      this.chapterId = null;
      this.topicId = null;
      this.lessonsList = [];
      this.chaptersList = [];
      this.topicsList = [];
    }

    this.http.get<any>(`${environment.apiUrl}/course/${courseId}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.lessonsList = res.data.lessons || [];
          if (!resetSelections) {
            if (this.lessonId) {
              const lesson = this.lessonsList.find(l => Number(l.id) === Number(this.lessonId));
              this.chaptersList = lesson ? lesson.chapters || [] : [];
              if (this.chapterId) {
                const chapter = this.chaptersList.find(c => Number(c.id) === Number(this.chapterId));
                this.topicsList = chapter ? chapter.topics || [] : [];
              }
            }
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching course structure:', err)
    });
  }

  onLessonChange(): void {
    this.chapterId = null;
    this.topicId = null;
    const val: any = this.lessonId;
    const parsedId = val === 'null' || val === 'undefined' ? null : val;
    const lesson = parsedId ? this.lessonsList.find(l => Number(l.id) === Number(parsedId)) : null;
    this.chaptersList = lesson ? lesson.chapters || [] : [];
    this.topicsList = [];
    if (!parsedId) this.lessonId = null;
  }

  onChapterChange(): void {
    this.topicId = null;
    const val: any = this.chapterId;
    const parsedId = val === 'null' || val === 'undefined' ? null : val;
    const chapter = parsedId ? this.chaptersList.find(c => Number(c.id) === Number(parsedId)) : null;
    this.topicsList = chapter ? chapter.topics || [] : [];
    if (!parsedId) this.chapterId = null;
  }

  // Modals actions
  openAddQuiz(content: any): void {
    this.isEdit = false;
    this.selectedQuiz = null;
    this.isSaving = false;

    // Reset Form Fields
    this.categoryId = null;
    this.subcategoryId = null;
    this.subjectId = null;
    this.courseId = null;
    this.mentorId = null;
    this.lessonId = null;
    this.chapterId = null;
    this.topicId = null;
    this.quizTitle = '';
    this.quizDescription = '';
    this.quizPrice = 0;
    this.quizStatus = 'active';
    this.displayOrder = 1;
    this.questions = [];

    // Reset Dropdown cascades
    this.filteredSubcategories = [];
    this.filteredSubjects = [];
    this.filteredCourses = [];
    this.lessonsList = [];
    this.chaptersList = [];
    this.topicsList = [];

    this.cancelEditQuestion();
    setTimeout(() => {
      this.modalService.open(content, { size: 'xl', backdrop: 'static' });
    });
  }

  openEditQuiz(quiz: any, modalContent: any): void {
    this.isEdit = true;
    this.selectedQuiz = quiz;
    this.isSaving = false;
    this.cancelEditQuestion();

    // Fetch quiz details by ID to get the complete question objects
    this.http.get<any>(`${environment.apiUrl}/quiz/${quiz.id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const detail = res.data;
          this.quizTitle = detail.title || '';
          this.quizDescription = detail.description || '';
          this.quizPrice = Number(detail.price || 0);
          this.categoryId = detail.category_id || null;
          this.subcategoryId = detail.subcategory_id || null;
          this.subjectId = detail.subject_id || null;
          this.courseId = detail.course_id || null;
          this.mentorId = detail.mentor_id || null;
          this.lessonId = detail.lesson_id || null;
          this.chapterId = detail.chapter_id || null;
          this.topicId = detail.topic_id || null;
          this.quizStatus = detail.status || 'active';
          this.displayOrder = detail.display_order || 1;
          this.questions = detail.questions || [];

          // Map hierarchy cascades
          if (this.categoryId) {
            this.filteredSubcategories = this.subcategories.filter(sub => Number(sub.category_id) === Number(this.categoryId));
          }
          if (this.subcategoryId) {
            this.filteredSubjects = this.subjects.filter(sub => Number(sub.subcategory_id) === Number(this.subcategoryId));
          }
          if (this.subjectId) {
            this.filteredCourses = this.courses.filter(c => Number(c.subject_id) === Number(this.subjectId));
          }
          if (this.courseId) {
            this.onCourseChange(this.courseId, false);
          }

          setTimeout(() => {
            this.modalService.open(modalContent, { size: 'xl', backdrop: 'static' });
          });
        } else {
          this.toastr.error('Failed to load quiz details', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading quiz details:', err);
        this.toastr.error('Failed to fetch quiz details', 'Error');
      }
    });
  }

  openDeleteQuiz(quiz: any, modalContent: any): void {
    this.selectedQuiz = quiz;
    setTimeout(() => {
      this.modalService.open(modalContent, { size: 'md' });
    });
  }

  openViewAttempt(attempt: any, modalContent: any): void {
    this.selectedAttempt = attempt;
    setTimeout(() => {
      this.modalService.open(modalContent, { size: 'lg' });
    });
  }

  openViewQuiz(quiz: any, modalContent: any): void {
    this.viewingQuiz = null;
    this.http.get<any>(`${environment.apiUrl}/quiz/${quiz.id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.viewingQuiz = res.data;
          setTimeout(() => {
            this.modalService.open(modalContent, { size: 'lg', backdrop: 'static' });
          });
        } else {
          this.toastr.error('Failed to load quiz details', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading quiz details:', err);
        this.toastr.error('Failed to fetch quiz details', 'Error');
      }
    });
  }

  // Question Management Functions
  addQuestionToList(): void {
    if (!this.qText.trim()) {
      this.toastr.error('Question text is required', 'Validation Error');
      return;
    }
    if (!this.qOptA.trim() || !this.qOptB.trim() || !this.qOptC.trim() || !this.qOptD.trim()) {
      this.toastr.error('All four options (A, B, C, D) are required', 'Validation Error');
      return;
    }
    if (!this.qCorrect) {
      this.toastr.error('Please specify the correct option', 'Validation Error');
      return;
    }

    const questionObj = {
      question_text: this.qText.trim(),
      option_a: this.qOptA.trim(),
      option_b: this.qOptB.trim(),
      option_c: this.qOptC.trim(),
      option_d: this.qOptD.trim(),
      correct_option: this.qCorrect
    };

    if (this.isEditingQuestion) {
      // Keep existing properties like id, quiz_id if any (for updates)
      const existing = this.questions[this.editingQuestionIndex];
      this.questions[this.editingQuestionIndex] = {
        ...existing,
        ...questionObj
      };
      this.toastr.success('Question updated', 'Success');
      this.isEditingQuestion = false;
      this.editingQuestionIndex = -1;
    } else {
      this.questions.push(questionObj);
      this.toastr.success('Question added to list', 'Success');
    }

    // Reset fields
    this.qText = '';
    this.qOptA = '';
    this.qOptB = '';
    this.qOptC = '';
    this.qOptD = '';
    this.qCorrect = null;
    this.cdr.detectChanges();
  }

  editQuestion(index: number): void {
    const q = this.questions[index];
    this.qText = q.question_text;
    this.qOptA = q.option_a;
    this.qOptB = q.option_b;
    this.qOptC = q.option_c;
    this.qOptD = q.option_d;
    this.qCorrect = q.correct_option;
    this.isEditingQuestion = true;
    this.editingQuestionIndex = index;
    this.cdr.detectChanges();
  }

  removeQuestion(index: number): void {
    this.questions.splice(index, 1);
    if (this.isEditingQuestion && this.editingQuestionIndex === index) {
      this.cancelEditQuestion();
    } else if (this.isEditingQuestion && this.editingQuestionIndex > index) {
      this.editingQuestionIndex--;
    }
    this.toastr.info('Question removed', 'Info');
    this.cdr.detectChanges();
  }

  cancelEditQuestion(): void {
    this.qText = '';
    this.qOptA = '';
    this.qOptB = '';
    this.qOptC = '';
    this.qOptD = '';
    this.qCorrect = null;
    this.isEditingQuestion = false;
    this.editingQuestionIndex = -1;
    this.cdr.detectChanges();
  }

  // Quiz Save / Edit Actions
  saveQuiz(modal: any): void {
    if (!this.categoryId || !this.subcategoryId || !this.subjectId || !this.courseId || !this.mentorId) {
      this.toastr.error('Category, Subcategory, Subject, Course, and Mentor are required fields', 'Validation Error');
      return;
    }
    if (!this.quizTitle.trim()) {
      this.toastr.error('Quiz title is required', 'Validation Error');
      return;
    }
    if (this.questions.length === 0) {
      this.toastr.error('At least one question is required for the quiz', 'Validation Error');
      return;
    }

    this.isSaving = true;

    const payload = {
      title: this.quizTitle.trim(),
      description: this.quizDescription.trim(),
      price: Number(this.quizPrice || 0),
      course_id: Number(this.courseId),
      mentor_id: Number(this.mentorId),
      lesson_id: null,
      chapter_id: null,
      topic_id: null,
      status: this.quizStatus,
      display_order: Number(this.displayOrder || 1),
      questions: this.questions
    };

    if (this.isEdit && this.selectedQuiz) {
      this.http.put<any>(`${environment.apiUrl}/quiz/${this.selectedQuiz.id}`, payload, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          setTimeout(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
          if (res.success) {
            this.toastr.success('Quiz updated successfully', 'Success');
            this.loadQuizzes();
            modal.close();
          } else {
            this.toastr.error(res.message || 'Failed to update quiz', 'Error');
          }
        },
        error: (err) => {
          setTimeout(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
          console.error('Error updating quiz:', err);
          this.toastr.error('Server error updating quiz', 'Error');
        }
      });
    } else {
      this.http.post<any>(`${environment.apiUrl}/quiz`, payload, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          setTimeout(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
          if (res.success) {
            this.toastr.success('Quiz created successfully', 'Success');
            this.loadQuizzes();
            modal.close();
          } else {
            this.toastr.error(res.message || 'Failed to create quiz', 'Error');
          }
        },
        error: (err) => {
          setTimeout(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
          console.error('Error creating quiz:', err);
          this.toastr.error('Server error creating quiz', 'Error');
        }
      });
    }
  }

  // Quiz deletion
  deleteQuiz(id: number, modal: any): void {
    this.http.delete<any>(`${environment.apiUrl}/quiz/${id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Quiz soft-deleted successfully', 'Success');
          this.loadQuizzes();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete quiz', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting quiz:', err);
        this.toastr.error('Server error deleting quiz', 'Error');
      }
    });
  }

  // Inline status toggle
  toggleStatus(quiz: any): void {
    const newStatus = quiz.status === 'active' ? 'inactive' : 'active';
    this.http.put<any>(`${environment.apiUrl}/quiz/${quiz.id}`, {
      title: quiz.title,
      status: newStatus
    }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Quiz status updated successfully', 'Success');
          this.loadQuizzes();
        } else {
          this.toastr.error(res.message || 'Failed to update status', 'Error');
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.toastr.error('Error updating quiz status', 'Error');
      }
    });
  }

  // Filter queries
  filteredQuizzes(): any[] {
    if (!this.searchQuizQuery.trim()) {
      return this.quizzes;
    }
    const q = this.searchQuizQuery.toLowerCase();
    return this.quizzes.filter(quiz => 
      (quiz.title && quiz.title.toLowerCase().includes(q)) ||
      (this.getCourseName(quiz.course_id).toLowerCase().includes(q))
    );
  }

  filteredResults(): any[] {
    if (!this.searchResultQuery.trim()) {
      return this.quizResults;
    }
    const q = this.searchResultQuery.toLowerCase();
    return this.quizResults.filter(res => 
      (res.student_name && res.student_name.toLowerCase().includes(q)) ||
      (res.student_email && res.student_email.toLowerCase().includes(q)) ||
      (res.quiz_title && res.quiz_title.toLowerCase().includes(q)) ||
      (res.course_name && res.course_name.toLowerCase().includes(q))
    );
  }

  // Helper score text/badge formatting
  getScoreBadgeClass(score: any): string {
    const s = Number(score);
    if (s >= 80) return 'bg-success-transparent text-success';
    if (s >= 50) return 'bg-warning-transparent text-warning';
    return 'bg-danger-transparent text-danger';
  }

  getScoreTextClass(score: any): string {
    const s = Number(score);
    if (s >= 80) return 'text-success';
    if (s >= 50) return 'text-warning';
    return 'text-danger';
  }

  dropQuiz(event: CdkDragDrop<any[]>): void {
    if (this.searchQuizQuery && this.searchQuizQuery.trim()) {
      const filtered = this.filteredQuizzes();
      const movedItem = filtered[event.previousIndex];
      const targetItem = filtered[event.currentIndex];
      const prevIdx = this.quizzes.indexOf(movedItem);
      const currIdx = this.quizzes.indexOf(targetItem);
      if (prevIdx !== -1 && currIdx !== -1) {
        moveItemInArray(this.quizzes, prevIdx, currIdx);
      }
    } else {
      moveItemInArray(this.quizzes, event.previousIndex, event.currentIndex);
    }
    this.updateQuizOrder();
  }

  updateQuizOrder(): void {
    const order = this.quizzes.map(quiz => quiz.id);
    this.http.put<any>(`${environment.apiUrl}/quiz/reorder`, { order }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.toastr.success('Quiz order updated successfully', 'Success');
        }
      },
      error: (err) => {
        console.warn('Quiz reorder endpoint notice:', err);
      }
    });
  }
}
