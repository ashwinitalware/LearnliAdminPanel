export interface CourseModel {
  courseTitle: string;
  category: string;
  courseType: string; // e.g., 'Course'
  language: string;
  subject: string;
  courseLevel: string;
  organization: string;
  instructor: string;
  courseDuration: string; // e.g., '72 Hours'
  courseTag: string;
  videoSource: string;
  thumbnail: string; // File path or base64
  isDownloadable: boolean;
  isFeatured: boolean;
  isFree: boolean;
  discountThisCourse: boolean;
  coursePrice: number;
  shortDescription: string;
  description: string; // Rich text content
  isPrivateCourse: boolean;
}
