import { Component } from '@angular/core';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SpkReusableTables } from '../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';

@Component({
  selector: 'app-manage-students',
  standalone: true,
  imports: [
    SpkReusableTables,
    SpkDropdowns,
    NgbNavModule
  ],
  templateUrl: './manage-students.html',
  styleUrls: ['./manage-students.scss']
})
export class ManageStudents {

  constructor(private modalService: NgbModal) {}

  open(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'xl'
    });
  }

  openDeleteModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'sm'
    });
  }

  openStatusModal(content: any) {
  this.modalService.open(content, {
    centered: true,
    size: 'sm'
  });
}

  // Enrolled Courses
  enrolledCourses = [
    // {
    //   title: 'Mathematics with Animation',
    //   category: 'Web Design',
    //   lessons: 14,
    //   enroll: 57,
    //   rating: 5.0,
    //   price: 10,
    //   image: './assets/images/media/media-40.jpg'
    // },
    {
      title: 'Angular Masterclass',
      category: 'Development',
      lessons: 20,
      enroll: 120,
      rating: 4.8,
      price: 15,
      image: './assets/images/media/media-41.jpg'
    },
    {
      title: 'React Advanced',
      category: 'Frontend',
      lessons: 18,
      enroll: 95,
      rating: 4.9,
      price: 20,
      image: './assets/images/media/media-42.jpg'
    }
  ];

  // Certificates Gallery
  certificateImages = [
    './assets/images/media/media-40.jpg',
    './assets/images/media/media-41.jpg',
    './assets/images/media/media-45.jpg'
  ];

}