import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export interface AudioTrackItem {
  id?: number | string;
  title: string;
  duration: string;
  file: File | null;
  fileName: string;
  existingFile?: string;
  order_index?: number;
}

@Component({
  selector: 'app-add-audio',
  imports: [SpkReusableTables, FormsModule, CommonModule, DragDropModule],
  templateUrl: './add-audio.html',
  styleUrl: './add-audio.scss'
})
export class AddAudio implements OnInit {
  categories: any[] = [];
  subcategories: any[] = [];
  subjects: any[] = [];
  courses: any[] = [];
  mentors: any[] = [];
  audios: any[] = [];
  filteredAudios: any[] = [];
  searchTerm: string = '';

  selectedAudio: any = null;
  viewingAudio: any = null;
  isUploading = false;
  isLoadingDetails = false;

  // Add Form Hierarchy Fields
  categoryId: number | null = null;
  subcategoryId: number | null = null;
  subjectId: number | null = null;
  courseId: number | null = null;
  mentorId: number | null = null;
  lessonId: number | null = null;
  chapterId: number | null = null;
  topicId: number | null = null;

  // Add Form Global Fields
  audioTitle: string = ''; // Audio Main Title
  audioPrice: number | null = null; // Total Price
  audioWalletPoints: number | null = null; // Wallet Points
  audioDuration: string = ''; // Total Duration
  audioDescription: string = ''; // Description
  previewAudioFile: File | null = null; // Audio Preview Sample File
  previewAudioFileName: string = '';

  // Add Form Multiple Audio Tracks
  audioTracks: AudioTrackItem[] = [];

  // Edit Form Hierarchy Fields
  editCategoryId: number | null = null;
  editSubcategoryId: number | null = null;
  editSubjectId: number | null = null;
  editCourseId: number | null = null;
  editMentorId: number | null = null;
  editLessonId: number | null = null;
  editChapterId: number | null = null;
  editTopicId: number | null = null;

  // Edit Form Global Fields
  editAudioTitle: string = ''; // Audio Main Title
  editAudioPrice: number | null = null; // Total Price
  editAudioWalletPoints: number | null = null; // Wallet Points
  editAudioDuration: string = ''; // Total Duration
  editAudioDescription: string = ''; // Description
  editPreviewAudioFile: File | null = null;
  editPreviewAudioFileName: string = '';
  existingPreviewAudioFile: string = '';

  // Edit Form Multiple Audio Tracks
  editAudioTracks: AudioTrackItem[] = [];

  // Cascading lists (Add Form)
  filteredSubcategories: any[] = [];
  filteredSubjects: any[] = [];
  filteredCourses: any[] = [];
  lessonsList: any[] = [];
  chaptersList: any[] = [];
  topicsList: any[] = [];

  // Cascading lists (Edit Form)
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
    this.loadCourses();
    this.loadMentors();
    this.loadAudios();
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
        if (res && res.success) {
          this.categories = res.data || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error categories:', err)
    });
  }

  loadSubcategories(): void {
    this.http.get<any>(`${environment.apiUrl}/subcategory`).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.subcategories = res.data || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error subcategories:', err)
    });
  }

  loadSubjects(): void {
    this.http.get<any>(`${environment.apiUrl}/subject`).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.subjects = res.data || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error subjects:', err)
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
      error: (err) => console.error('Error courses:', err)
    });
  }

  loadMentors(): void {
    this.http.get<any>(`${environment.apiUrl}/mentor`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.mentors = res.data || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error mentors:', err)
    });
  }

  loadAudios(): void {
    this.http.get<any>(`${environment.apiUrl}/audio`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.audios = res.data || [];
          this.filterAudios();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error audios:', err);
        this.toastr.error('Failed to load audios list', 'Error');
      }
    });
  }

  filterAudios(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAudios = [...this.audios];
      return;
    }
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredAudios = this.audios.filter(audio => {
      const title = (audio.audio_title || audio.audio_main_title || '').toLowerCase();
      const mentorName = (audio.mentor_name || audio.mentor?.full_name || this.getMentorName(audio.mentor_id)).toLowerCase();
      const courseName = (audio.course_name || this.getCourseName(audio.course_id)).toLowerCase();
      const lessonTitle = (audio.lesson_title || '').toLowerCase();
      const chapterTitle = (audio.chapter_title || '').toLowerCase();
      const topicTitle = (audio.topic_title || '').toLowerCase();
      const desc = (audio.description || '').toLowerCase();
      return title.includes(term) || mentorName.includes(term) || courseName.includes(term) ||
             lessonTitle.includes(term) || chapterTitle.includes(term) || topicTitle.includes(term) ||
             desc.includes(term);
    });
  }

  getMentorName(mentorId: any): string {
    if (!mentorId) return '-';
    const mentor = this.mentors.find(m => Number(m.id) === Number(mentorId));
    return mentor ? mentor.full_name : '-';
  }

  getCourseName(courseId: any): string {
    if (!courseId) return '-';
    const course = this.courses.find(c => Number(c.id) === Number(courseId));
    return course ? course.course_name : '-';
  }

  getAudioUrl(filename: string): string {
    if (!filename) return '';
    if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
    const baseUrl = environment.apiUrl.replace('/api/v1', '');
    return `${baseUrl}/uploads/${filename}`;
  }

  getTracks(audio: any): any[] {
    if (!audio) return [];
    if (Array.isArray(audio.audio_files) && audio.audio_files.length > 0) {
      return audio.audio_files;
    }
    if (Array.isArray(audio.tracks) && audio.tracks.length > 0) {
      return audio.tracks;
    }
    if (Array.isArray(audio.items) && audio.items.length > 0) {
      return audio.items;
    }
    if (typeof audio.audio_files === 'string') {
      try {
        const parsed = JSON.parse(audio.audio_files);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore json error
      }
    }
    if (typeof audio.tracks === 'string') {
      try {
        const parsed = JSON.parse(audio.tracks);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore json error
      }
    }
    if (audio.audio_file) {
      return [{
        title: audio.audio_title || 'Audio Track 1',
        duration: audio.duration || audio.total_duration || '-',
        audio_file: audio.audio_file
      }];
    }
    return [];
  }

  getTrackCount(audio: any): number {
    return this.getTracks(audio).length;
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
        if (res && res.success && res.data) {
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
      error: (err) => console.error('Error fetching course structure for audio:', err)
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

  moveTrack(index: number, direction: 'up' | 'down', isEdit = false): void {
    const list = isEdit ? this.editAudioTracks : this.audioTracks;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < list.length) {
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
    }
  }

  // --- Add Modal Handling ---
  open(content: any): void {
    // Reset Add Form fields
    this.categoryId = null;
    this.subcategoryId = null;
    this.subjectId = null;
    this.courseId = null;
    this.mentorId = null;
    this.lessonId = null;
    this.chapterId = null;
    this.topicId = null;
    this.audioTitle = '';
    this.audioPrice = null;
    this.audioWalletPoints = null;
    this.audioDuration = '';
    this.audioDescription = '';
    this.previewAudioFile = null;
    this.previewAudioFileName = '';

    this.filteredSubcategories = [];
    this.filteredSubjects = [];
    this.filteredCourses = [];
    this.lessonsList = [];
    this.chaptersList = [];
    this.topicsList = [];

    // Initialize with 1 default empty track
    this.audioTracks = [
      {
        title: '',
        duration: '',
        file: null,
        fileName: ''
      }
    ];

    this.modalService.open(content, { centered: true, size: 'xl' });
  }

  addTrack(): void {
    this.audioTracks.push({
      title: '',
      duration: '',
      file: null,
      fileName: ''
    });
  }

  removeTrack(index: number): void {
    if (this.audioTracks.length > 1) {
      this.audioTracks.splice(index, 1);
    } else {
      this.audioTracks[0] = {
        title: '',
        duration: '',
        file: null,
        fileName: ''
      };
    }
  }

  onTrackFileSelected(event: any, index: number, isEdit = false): void {
    const file = event.target.files?.[0];
    if (file) {
      if (isEdit) {
        this.editAudioTracks[index].file = file;
        this.editAudioTracks[index].fileName = file.name;
      } else {
        this.audioTracks[index].file = file;
        this.audioTracks[index].fileName = file.name;
      }
    }
  }

  onPreviewFileSelected(event: any, isEdit = false): void {
    const file = event.target.files?.[0];
    if (file) {
      if (isEdit) {
        this.editPreviewAudioFile = file;
        this.editPreviewAudioFileName = file.name;
      } else {
        this.previewAudioFile = file;
        this.previewAudioFileName = file.name;
      }
    }
  }

  clearPreviewFile(isEdit = false): void {
    if (isEdit) {
      this.editPreviewAudioFile = null;
      this.editPreviewAudioFileName = '';
      this.existingPreviewAudioFile = '';
    } else {
      this.previewAudioFile = null;
      this.previewAudioFileName = '';
    }
  }

  // --- Edit Modal Handling ---
  openEdit(audio: any, content: any): void {
    this.selectedAudio = audio;

    const matchedCourse = this.courses.find(c => Number(c.id) === Number(audio.course_id));
    this.editCategoryId = audio.category_id ? Number(audio.category_id) : (matchedCourse ? Number(matchedCourse.category_id) : null);
    this.editFilteredSubcategories = this.editCategoryId
      ? this.subcategories.filter(sub => Number(sub.category_id) === Number(this.editCategoryId))
      : [];
    this.editSubcategoryId = audio.subcategory_id ? Number(audio.subcategory_id) : (matchedCourse ? Number(matchedCourse.subcategory_id) : null);
    this.editFilteredSubjects = this.editSubcategoryId
      ? this.subjects.filter(sub => Number(sub.subcategory_id) === Number(this.editSubcategoryId))
      : [];
    this.editSubjectId = audio.subject_id ? Number(audio.subject_id) : (matchedCourse ? Number(matchedCourse.subject_id) : null);
    this.editFilteredCourses = this.editSubjectId
      ? this.courses.filter(c => Number(c.subject_id) === Number(this.editSubjectId))
      : (this.editCategoryId ? this.courses.filter(c => Number(c.category_id) === Number(this.editCategoryId)) : this.courses);
    this.editCourseId = audio.course_id ? Number(audio.course_id) : null;

    this.editMentorId = audio.mentor_id ? Number(audio.mentor_id) : null;
    this.editAudioTitle = audio.audio_title || audio.audio_main_title || '';
    this.editAudioPrice = (audio.price != null && Number(audio.price) !== 0) ? Number(audio.price) : null;
    this.editAudioWalletPoints = (audio.wallet_points != null && Number(audio.wallet_points) !== 0) ? Number(audio.wallet_points) : null;
    this.editAudioDuration = audio.duration || audio.total_duration || '';
    this.editAudioDescription = audio.description || '';

    this.editPreviewAudioFile = null;
    this.editPreviewAudioFileName = '';
    this.existingPreviewAudioFile = audio.audio_preview || audio.preview_file || audio.preview_sample || audio.sample_audio_file || '';

    // Initialize tracks from item
    const existingTracks = this.getTracks(audio);
    if (existingTracks && existingTracks.length > 0) {
      this.editAudioTracks = existingTracks.map((t: any, idx: number) => ({
        id: t.id || idx + 1,
        title: t.title || t.audio_title || `Track ${idx + 1}`,
        duration: t.duration || '',
        file: null,
        fileName: t.audio_file || t.file || '',
        existingFile: t.audio_file || t.file || '',
        order_index: t.order_index ?? idx
      }));
    } else {
      this.editAudioTracks = [
        {
          title: '',
          duration: '',
          file: null,
          fileName: ''
        }
      ];
    }

    if (this.editCourseId) {
      this.http.get<any>(`${environment.apiUrl}/course/${this.editCourseId}`, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          if (res && res.success && res.data) {
            this.editLessonsList = res.data.lessons || [];
            this.editLessonId = audio.lesson_id ? Number(audio.lesson_id) : null;
            if (this.editLessonId) {
              const lesson = this.editLessonsList.find(l => Number(l.id) === Number(this.editLessonId));
              this.editChaptersList = lesson ? lesson.chapters || [] : [];
              this.editChapterId = audio.chapter_id ? Number(audio.chapter_id) : null;
              if (this.editChapterId) {
                const chapter = this.editChaptersList.find(c => Number(c.id) === Number(this.editChapterId));
                this.editTopicsList = chapter ? chapter.topics || [] : [];
                this.editTopicId = audio.topic_id ? Number(audio.topic_id) : null;
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
        error: (err) => console.error('Error fetching course structure for audio edit:', err)
      });
    } else {
      this.editLessonsList = [];
      this.editChaptersList = [];
      this.editTopicsList = [];
      this.editLessonId = null;
      this.editChapterId = null;
      this.editTopicId = null;
    }

    // Fetch single audio by ID to ensure latest fresh tracks
    this.http.get<any>(`${environment.apiUrl}/audio/${audio.id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const detailedAudio = res.data;
          this.editMentorId = detailedAudio.mentor_id ? Number(detailedAudio.mentor_id) : null;
          this.editAudioTitle = detailedAudio.audio_title || detailedAudio.audio_main_title || '';
          this.editAudioPrice = (detailedAudio.price != null && Number(detailedAudio.price) !== 0) ? Number(detailedAudio.price) : null;
          this.editAudioWalletPoints = (detailedAudio.wallet_points != null && Number(detailedAudio.wallet_points) !== 0) ? Number(detailedAudio.wallet_points) : null;
          this.editAudioDuration = detailedAudio.duration || detailedAudio.total_duration || '';
          this.editAudioDescription = detailedAudio.description || '';
          this.existingPreviewAudioFile = detailedAudio.audio_preview || detailedAudio.sample_audio_file || '';

          const freshTracks = this.getTracks(detailedAudio);
          if (freshTracks && freshTracks.length > 0) {
            this.editAudioTracks = freshTracks.map((t: any, idx: number) => ({
              id: t.id,
              title: t.title || t.audio_title || `Track ${idx + 1}`,
              duration: t.duration || '',
              file: null,
              fileName: t.audio_file || t.file || '',
              existingFile: t.audio_file || t.file || '',
              order_index: t.order_index ?? idx
            }));
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching audio detail:', err)
    });

    this.modalService.open(content, { centered: true, size: 'xl' });
  }

  addEditTrack(): void {
    this.editAudioTracks.push({
      title: '',
      duration: '',
      file: null,
      fileName: ''
    });
  }

  removeEditTrack(index: number): void {
    if (this.editAudioTracks.length > 1) {
      this.editAudioTracks.splice(index, 1);
    } else {
      this.editAudioTracks[0] = {
        title: '',
        duration: '',
        file: null,
        fileName: '',
        existingFile: ''
      };
    }
  }

  // --- Upload Helper ---
  private async uploadSingleFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/upload`, formData, { headers: this.getHeaders() })
    );
    if (res && res.success) {
      return res.filename || res.data?.filename || res.file || res.data?.file || '';
    }
    throw new Error(res?.message || 'File upload failed');
  }

  // --- Add Audio Submission ---
  async addAudio(modal: any): Promise<void> {
    if (!this.audioTitle.trim()) {
      this.toastr.error('Audio Main Title is required.', 'Validation Error');
      return;
    }

    this.isUploading = true;

    try {
      // 1. Upload Preview Sample file if provided
      let previewFilename = '';
      if (this.previewAudioFile) {
        previewFilename = await this.uploadSingleFile(this.previewAudioFile);
      }

      // 2. Upload Audio Track files
      const uploadedTracks: any[] = [];
      for (let i = 0; i < this.audioTracks.length; i++) {
        const track = this.audioTracks[i];
        if (track.title.trim() || track.file) {
          let trackFilename = '';
          if (track.file) {
            trackFilename = await this.uploadSingleFile(track.file);
          }
          uploadedTracks.push({
            title: track.title.trim() || `Track ${i + 1}`,
            audio_title: track.title.trim() || `Track ${i + 1}`,
            duration: track.duration.trim(),
            audio_file: trackFilename,
            file: trackFilename,
            order_index: i
          });
        }
      }

      // 3. Construct master audio payload matching backend
      const mainAudioFile = uploadedTracks.length > 0 ? (uploadedTracks[0].audio_file || previewFilename) : previewFilename;

      const payload = {
        category_id: this.categoryId ? Number(this.categoryId) : null,
        subcategory_id: this.subcategoryId ? Number(this.subcategoryId) : null,
        subject_id: this.subjectId ? Number(this.subjectId) : null,
        course_id: this.courseId ? Number(this.courseId) : null,
        lesson_id: this.lessonId ? Number(this.lessonId) : null,
        chapter_id: this.chapterId ? Number(this.chapterId) : null,
        topic_id: this.topicId ? Number(this.topicId) : null,
        mentor_id: this.mentorId ? Number(this.mentorId) : null,
        audio_title: this.audioTitle.trim(),
        audio_main_title: this.audioTitle.trim(),
        price: (this.audioPrice !== null && this.audioPrice !== undefined && this.audioPrice !== ('' as any)) ? Number(this.audioPrice) : 0,
        total_price: (this.audioPrice !== null && this.audioPrice !== undefined && this.audioPrice !== ('' as any)) ? Number(this.audioPrice) : 0,
        wallet_points: (this.audioWalletPoints !== null && this.audioWalletPoints !== undefined && this.audioWalletPoints !== ('' as any)) ? Number(this.audioWalletPoints) : 0,
        duration: this.audioDuration.trim(),
        total_duration: this.audioDuration.trim(),
        description: this.audioDescription.trim(),
        audio_preview: previewFilename || null,
        preview_file: previewFilename || null,
        sample_audio_file: previewFilename || null,
        audio_file: mainAudioFile || null,
        audio_files: uploadedTracks,
        tracks: uploadedTracks
      };

      const res = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/audio`, payload, { headers: this.getHeaders() })
      );

      this.isUploading = false;
      if (res && res.success) {
        this.toastr.success('Audio created successfully!', 'Success');
        this.loadAudios();
        modal.close();
      } else {
        this.toastr.error(res?.message || 'Failed to create audio', 'Error');
      }
    } catch (err: any) {
      this.isUploading = false;
      console.error('Error adding audio:', err);
      this.toastr.error(err?.message || 'Error occurred while saving audio', 'Error');
    }
  }

  // --- Update Audio Submission ---
  async updateAudio(modal: any): Promise<void> {
    if (!this.editAudioTitle.trim()) {
      this.toastr.error('Audio Main Title is required.', 'Validation Error');
      return;
    }

    this.isUploading = true;

    try {
      // 1. Preview Sample file upload or retain existing
      let previewFilename = this.existingPreviewAudioFile;
      if (this.editPreviewAudioFile) {
        previewFilename = await this.uploadSingleFile(this.editPreviewAudioFile);
      }

      // 2. Audio Track files upload or retain existing
      const updatedTracks: any[] = [];
      for (let i = 0; i < this.editAudioTracks.length; i++) {
        const track = this.editAudioTracks[i];
        if (track.title.trim() || track.file || track.existingFile) {
          let trackFilename = track.existingFile || '';
          if (track.file) {
            trackFilename = await this.uploadSingleFile(track.file);
          }
          updatedTracks.push({
            id: track.id,
            title: track.title.trim() || `Track ${i + 1}`,
            audio_title: track.title.trim() || `Track ${i + 1}`,
            duration: track.duration.trim(),
            audio_file: trackFilename,
            file: trackFilename,
            order_index: i
          });
        }
      }

      const mainAudioFile = updatedTracks.length > 0 ? (updatedTracks[0].audio_file || previewFilename) : previewFilename;

      const payload = {
        category_id: this.editCategoryId ? Number(this.editCategoryId) : null,
        subcategory_id: this.editSubcategoryId ? Number(this.editSubcategoryId) : null,
        subject_id: this.editSubjectId ? Number(this.editSubjectId) : null,
        course_id: this.editCourseId ? Number(this.editCourseId) : null,
        lesson_id: this.editLessonId ? Number(this.editLessonId) : null,
        chapter_id: this.editChapterId ? Number(this.editChapterId) : null,
        topic_id: this.editTopicId ? Number(this.editTopicId) : null,
        mentor_id: this.editMentorId ? Number(this.editMentorId) : null,
        audio_title: this.editAudioTitle.trim(),
        audio_main_title: this.editAudioTitle.trim(),
        price: (this.editAudioPrice !== null && this.editAudioPrice !== undefined && this.editAudioPrice !== ('' as any)) ? Number(this.editAudioPrice) : 0,
        total_price: (this.editAudioPrice !== null && this.editAudioPrice !== undefined && this.editAudioPrice !== ('' as any)) ? Number(this.editAudioPrice) : 0,
        wallet_points: (this.editAudioWalletPoints !== null && this.editAudioWalletPoints !== undefined && this.editAudioWalletPoints !== ('' as any)) ? Number(this.editAudioWalletPoints) : 0,
        duration: this.editAudioDuration.trim(),
        total_duration: this.editAudioDuration.trim(),
        description: this.editAudioDescription.trim(),
        audio_preview: previewFilename || null,
        preview_file: previewFilename || null,
        sample_audio_file: previewFilename || null,
        audio_file: mainAudioFile || null,
        audio_files: updatedTracks,
        tracks: updatedTracks
      };

      const res = await firstValueFrom(
        this.http.put<any>(`${environment.apiUrl}/audio/${this.selectedAudio.id}`, payload, { headers: this.getHeaders() })
      );

      this.isUploading = false;
      if (res && res.success) {
        this.toastr.success('Audio updated successfully!', 'Success');
        this.loadAudios();
        modal.close();
      } else {
        this.toastr.error(res?.message || 'Failed to update audio', 'Error');
      }
    } catch (err: any) {
      this.isUploading = false;
      console.error('Error updating audio:', err);
      this.toastr.error(err?.message || 'Error occurred while updating audio', 'Error');
    }
  }

  // --- Status Toggle ---
  toggleStatus(audio: any): void {
    const newStatus = audio.status === 'active' ? 'inactive' : 'active';
    this.http.patch<any>(`${environment.apiUrl}/audio/status/${audio.id}`, { status: newStatus }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.toastr.success(`Audio status updated to ${newStatus}`, 'Success');
          audio.status = newStatus;
          this.cdr.detectChanges();
        } else {
          this.toastr.error(res?.message || 'Failed to update status', 'Error');
          this.loadAudios();
        }
      },
      error: (err) => {
        console.error('Error changing audio status:', err);
        this.toastr.error('Error updating audio status', 'Error');
        this.loadAudios();
      }
    });
  }

  // --- View Details ---
  openView(audio: any, content: any): void {
    this.viewingAudio = audio;
    this.modalService.open(content, { centered: true, size: 'xl' });

    // Fetch fresh single audio details with all tracks
    this.http.get<any>(`${environment.apiUrl}/audio/${audio.id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.viewingAudio = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching viewing audio details:', err)
    });
  }

  // --- Delete Modal ---
  openDelete(audio: any, content: any): void {
    this.selectedAudio = audio;
    this.modalService.open(content, { centered: true });
  }

  deleteAudio(id: number, modal: any): void {
    this.http.delete<any>(`${environment.apiUrl}/audio/${id}`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.toastr.success('Audio deleted successfully', 'Success');
          this.loadAudios();
          modal.close();
        } else {
          this.toastr.error(res?.message || 'Failed to delete audio', 'Error');
        }
      },
      error: (err) => {
        console.error('Error deleting audio:', err);
        this.toastr.error('Error deleting audio', 'Error');
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    if (this.searchTerm && this.searchTerm.trim()) {
      const movedItem = this.filteredAudios[event.previousIndex];
      const targetItem = this.filteredAudios[event.currentIndex];
      const prevIdx = this.audios.indexOf(movedItem);
      const currIdx = this.audios.indexOf(targetItem);
      if (prevIdx !== -1 && currIdx !== -1) {
        moveItemInArray(this.audios, prevIdx, currIdx);
      }
      moveItemInArray(this.filteredAudios, event.previousIndex, event.currentIndex);
    } else {
      moveItemInArray(this.filteredAudios, event.previousIndex, event.currentIndex);
      this.audios = [...this.filteredAudios];
    }
    this.updateAudioOrder();
  }

  updateAudioOrder(): void {
    const order = this.audios.map(audio => audio.id);
    this.http.put<any>(`${environment.apiUrl}/audio/reorder`, { order }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.toastr.success('Audio order updated successfully', 'Success');
        }
      },
      error: (err) => {
        console.warn('Audio reorder endpoint notice:', err);
      }
    });
  }
}
