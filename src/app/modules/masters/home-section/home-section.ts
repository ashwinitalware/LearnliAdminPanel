import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { AuthService } from '../../../shared/services/auth.service';
import { HomeSectionService, HomeSectionItem, CourseOption } from './home-section.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DragDropModule, SpkReusableTables],
  templateUrl: './home-section.html',
  styleUrl: './home-section.scss'
})
export class HomeSection implements OnInit {
  sections: HomeSectionItem[] = [];
  filteredSections: HomeSectionItem[] = [];
  selectedSection: HomeSectionItem | null = null;
  availableCourses: CourseOption[] = [];

  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isLoadingEdit: boolean = false;
  isLoadingCourses: boolean = false;

  // Search & Filter for Sections Table
  searchText: string = '';
  statusFilter: string = 'all';

  // Add Form bindings
  sectionTitle: string = '';
  sectionSortOrder: number = 1;
  sectionStatus: 'active' | 'inactive' = 'active';
  selectedCourseIds: number[] = [];
  courseSearchText: string = '';

  // Edit Form bindings
  editSectionTitle: string = '';
  editSectionSortOrder: number = 1;
  editSectionStatus: 'active' | 'inactive' = 'active';
  editSelectedCourseIds: number[] = [];
  editCourseSearchText: string = '';

  constructor(
    private modalService: NgbModal,
    private homeSectionService: HomeSectionService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken() || localStorage.getItem('token');
    if (!token) {
      this.toastr.warning('Please log in first.', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadSections();
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoadingCourses = true;
    this.cdr.detectChanges();

    this.homeSectionService.getAllCourses().subscribe({
      next: (res) => {
        this.isLoadingCourses = false;
        if (res && res.success && Array.isArray(res.data)) {
          this.availableCourses = res.data;
        } else if (Array.isArray(res)) {
          this.availableCourses = res;
        } else if (res && Array.isArray((res as any).data)) {
          this.availableCourses = (res as any).data;
        } else {
          this.availableCourses = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingCourses = false;
        console.error('Error fetching courses for multi-select:', err);
        this.toastr.error('Failed to load courses for assignment', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  loadSections(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.homeSectionService.getSections().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.sections = res.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          this.applyFilter();
        } else {
          this.sections = [];
          this.filteredSections = [];
          this.toastr.error(res.message || 'Failed to load home sections', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading home sections:', err);
        this.toastr.error(err.error?.message || 'Server error while fetching home sections', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    let list = [...this.sections];

    if (this.statusFilter !== 'all') {
      list = list.filter(item => item.status === this.statusFilter);
    }

    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase().trim();
      list = list.filter(item => {
        const titleMatch = (item.title || item.section_name || item.name || '').toLowerCase().includes(query);
        return titleMatch;
      });
    }

    this.filteredSections = list;
    this.cdr.detectChanges();
  }

  onFilterStatusChange(status: string): void {
    this.statusFilter = status;
    this.applyFilter();
  }

  getActiveCount(): number {
    return this.sections.filter(s => s.status === 'active').length;
  }

  getInactiveCount(): number {
    return this.sections.filter(s => s.status === 'inactive').length;
  }

  getNextSortOrder(): number {
    if (!this.sections.length) return 1;
    const maxOrder = Math.max(...this.sections.map(s => Number(s.sort_order) || 0));
    return maxOrder + 1;
  }

  // Get full absolute media URL for course / mentor images
  getMediaUrl(path: string | undefined | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${environment.baseUrl}${cleanPath}`;
  }

  // 🔍 Filter Courses by Search Query (Course Name, Mentor Name, Category, Subject)
  getFilteredCourses(searchTerm: string): CourseOption[] {
    if (!searchTerm || !searchTerm.trim()) {
      return this.availableCourses;
    }
    const query = searchTerm.toLowerCase().trim();
    return this.availableCourses.filter(course => {
      const courseName = (course.course_name || '').toLowerCase();
      const mentorName = (course.mentor_name || course.mentor?.full_name || '').toLowerCase();
      const categoryName = (course.category_name || '').toLowerCase();
      const subjectName = (course.subject_name || '').toLowerCase();
      const subcategoryName = (course.subcategory_name || '').toLowerCase();
      return courseName.includes(query) ||
             mentorName.includes(query) ||
             categoryName.includes(query) ||
             subjectName.includes(query) ||
             subcategoryName.includes(query);
    });
  }

  // 🔘 Toggle Course Selection in Modal
  toggleCourseSelection(courseId: number, isEdit: boolean = false): void {
    const targetArray = isEdit ? this.editSelectedCourseIds : this.selectedCourseIds;
    const index = targetArray.indexOf(courseId);
    if (index === -1) {
      targetArray.push(courseId);
    } else {
      targetArray.splice(index, 1);
    }
    this.cdr.detectChanges();
  }

  // Check if Course is Selected
  isCourseSelected(courseId: number, isEdit: boolean = false): boolean {
    const targetArray = isEdit ? this.editSelectedCourseIds : this.selectedCourseIds;
    return targetArray.includes(courseId);
  }

  // Select All Available Courses
  selectAllCourses(isEdit: boolean = false): void {
    const allIds = this.availableCourses.map(c => c.id);
    if (isEdit) {
      this.editSelectedCourseIds = [...allIds];
    } else {
      this.selectedCourseIds = [...allIds];
    }
    this.cdr.detectChanges();
  }

  // Clear Selected Courses
  clearSelectedCourses(isEdit: boolean = false): void {
    if (isEdit) {
      this.editSelectedCourseIds = [];
    } else {
      this.selectedCourseIds = [];
    }
    this.cdr.detectChanges();
  }

  // Remove Single Course from Selected Chips
  removeSelectedCourse(courseId: number, isEdit: boolean = false): void {
    if (isEdit) {
      this.editSelectedCourseIds = this.editSelectedCourseIds.filter(id => id !== courseId);
    } else {
      this.selectedCourseIds = this.selectedCourseIds.filter(id => id !== courseId);
    }
    this.cdr.detectChanges();
  }

  // Get Objects for Currently Selected Chips
  getSelectedCourseObjects(isEdit: boolean = false): CourseOption[] {
    const ids = isEdit ? this.editSelectedCourseIds : this.selectedCourseIds;
    return ids.map(id => {
      const found = this.availableCourses.find(c => c.id === id);
      if (found) return found;
      if (this.selectedSection && Array.isArray(this.selectedSection.courses)) {
        const fromSection = this.selectedSection.courses.find(c => c.id === id);
        if (fromSection) return fromSection;
      }
      return { id, course_name: `Course #${id}` } as CourseOption;
    });
  }

  // Helper to extract mentor name safely
  getCourseMentorName(course: CourseOption): string {
    return course.mentor_name || course.mentor?.full_name || '';
  }

  // Helper for Table & View Modal: Assigned Courses List
  getSectionAssignedCourses(section: HomeSectionItem | null): CourseOption[] {
    if (!section) return [];
    if (Array.isArray(section.courses) && section.courses.length > 0) {
      return section.courses;
    }
    if (Array.isArray(section.course_ids) && section.course_ids.length > 0) {
      return section.course_ids.map(id => {
        const found = this.availableCourses.find(c => c.id === id);
        return found || ({ id, course_name: `Course #${id}` } as CourseOption);
      });
    }
    return [];
  }

  // Helper for Table: Count of Assigned Courses
  getSectionCoursesCount(section: HomeSectionItem): number {
    if (section.courses_count !== undefined && section.courses_count !== null) {
      return section.courses_count;
    }
    if (Array.isArray(section.course_ids)) {
      return section.course_ids.length;
    }
    if (Array.isArray(section.courses)) {
      return section.courses.length;
    }
    return 0;
  }

  // ➕ Open Add Modal
  openAdd(content: any): void {
    this.sectionTitle = '';
    this.sectionSortOrder = this.getNextSortOrder();
    this.sectionStatus = 'active';
    this.selectedCourseIds = [];
    this.courseSearchText = '';

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  // ➕ Create Section
  createSection(modal: any): void {
    if (!this.sectionTitle.trim()) {
      this.toastr.error('Section title is required', 'Validation Error');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const payload = {
      title: this.sectionTitle.trim(),
      status: this.sectionStatus,
      sort_order: Number(this.sectionSortOrder) || 1,
      course_ids: this.selectedCourseIds
    };

    this.homeSectionService.createSection(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success(res.message || 'Home section created successfully', 'Success');
          this.loadSections();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to create home section', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creating home section:', err);
        this.toastr.error(err.error?.message || 'Failed to create section', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  // 🔍 Open Edit Modal with Single Section API fetch
  openEdit(section: HomeSectionItem, content: any): void {
    this.selectedSection = section;
    this.editSectionTitle = section.title || section.section_name || section.name || '';
    this.editSectionSortOrder = section.sort_order || 1;
    this.editSectionStatus = section.status || 'active';
    this.editSelectedCourseIds = section.course_ids ? [...section.course_ids] : (section.courses ? section.courses.map(c => c.id) : []);
    this.editCourseSearchText = '';
    this.isLoadingEdit = true;

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });

    // Call single section API as requested in API specification
    this.homeSectionService.getSectionById(section.id).subscribe({
      next: (res) => {
        this.isLoadingEdit = false;
        if (res.success && res.data) {
          this.selectedSection = res.data;
          this.editSectionTitle = res.data.title || res.data.section_name || res.data.name || '';
          this.editSectionSortOrder = res.data.sort_order ?? 1;
          this.editSectionStatus = res.data.status || 'active';
          if (Array.isArray(res.data.course_ids)) {
            this.editSelectedCourseIds = [...res.data.course_ids];
          } else if (Array.isArray(res.data.courses)) {
            this.editSelectedCourseIds = res.data.courses.map(c => c.id);
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingEdit = false;
        console.warn('Could not fetch section details by ID, using cached row data:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // ✏️ Update Section
  updateSection(modal: any): void {
    if (!this.selectedSection) return;
    if (!this.editSectionTitle.trim()) {
      this.toastr.error('Section title is required', 'Validation Error');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const payload = {
      title: this.editSectionTitle.trim(),
      status: this.editSectionStatus,
      sort_order: Number(this.editSectionSortOrder) || 1,
      course_ids: this.editSelectedCourseIds
    };

    this.homeSectionService.updateSection(this.selectedSection.id, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success(res.message || 'Home section updated successfully', 'Success');
          this.loadSections();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to update section', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error updating home section:', err);
        this.toastr.error(err.error?.message || 'Server error while updating section', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  // 👁️ View Section Details
  openView(section: HomeSectionItem, content: any): void {
    this.selectedSection = section;
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });

    if (section.id && (!section.courses || section.courses.length === 0)) {
      this.homeSectionService.getSectionById(section.id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.selectedSection = res.data;
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.warn('Could not fetch section view details:', err)
      });
    }
  }

  // 🗑️ Open Delete Confirmation Modal
  openDelete(section: HomeSectionItem, content: any): void {
    this.selectedSection = section;
    this.modalService.open(content, {
      centered: true
    });
  }

  // 🗑️ Delete Section
  deleteSection(modal: any): void {
    if (!this.selectedSection) return;

    const id = this.selectedSection.id;
    this.homeSectionService.deleteSection(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message || 'Home section deleted successfully', 'Success');
          this.loadSections();
          modal.close();
        } else {
          this.toastr.error(res.message || 'Failed to delete section', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting home section:', err);
        this.toastr.error(err.error?.message || 'Server error while deleting section', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  // 🔘 Toggle Status (Active / Inactive)
  toggleStatus(section: HomeSectionItem): void {
    const newStatus: 'active' | 'inactive' = section.status === 'active' ? 'inactive' : 'active';
    const oldStatus = section.status;

    // Optimistic UI update
    section.status = newStatus;
    this.cdr.detectChanges();

    this.homeSectionService.toggleStatus(section.id, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message || `Section is now ${newStatus}`, 'Success');
        } else {
          section.status = oldStatus;
          this.toastr.error(res.message || 'Failed to update status', 'Error');
          this.loadSections();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        section.status = oldStatus;
        console.error('Error toggling status:', err);
        this.toastr.error(err.error?.message || 'Failed to update status', 'Error');
        this.loadSections();
        this.cdr.detectChanges();
      }
    });
  }

  // ↕️ Drag & Drop Reorder
  drop(event: CdkDragDrop<HomeSectionItem[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.filteredSections, event.previousIndex, event.currentIndex);

    // If no filter is applied, update sections array as well
    if (this.statusFilter === 'all' && !this.searchText.trim()) {
      this.sections = [...this.filteredSections];
    } else {
      // Re-map order in full list
      const reorderedIds = this.filteredSections.map(s => s.id);
      this.sections.sort((a, b) => {
        const indexA = reorderedIds.indexOf(a.id);
        const indexB = reorderedIds.indexOf(b.id);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
    }

    this.updateSectionOrder();
  }

  updateSectionOrder(): void {
    const order = this.filteredSections.map(s => s.id);

    this.homeSectionService.reorderSections(order).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message || 'Section order updated successfully', 'Success');
          // Update local sort_order values to match new positions
          this.filteredSections.forEach((item, idx) => {
            item.sort_order = idx + 1;
          });
        } else {
          this.toastr.error(res.message || 'Failed to update order', 'Error');
          this.loadSections();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating order:', err);
        this.toastr.error(err.error?.message || 'Failed to save section order', 'Error');
        this.loadSections();
        this.cdr.detectChanges();
      }
    });
  }
}
