import { Component } from '@angular/core';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';

@Component({
  selector: 'app-student-subscription',
  standalone: true,
  imports: [
    SpkReusableTables,
    SpkDropdowns,
    NgbNavModule,
    NgSelectModule
  ],
  templateUrl: './student-subscription.html',
  styleUrls: ['./student-subscription.scss']
})
export class StudentSubscription {

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

  subjectList = [
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English'
  ];

}