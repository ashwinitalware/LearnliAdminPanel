import { Component } from '@angular/core';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';

@Component({
  selector: 'app-instructor-subscription',
  standalone: true,
  imports: [
    SpkReusableTables,
    SpkDropdowns,
    NgbNavModule,
    NgSelectModule
  ],
  templateUrl: './instructor-subscription.html',
  styleUrls: ['./instructor-subscription.scss']
})
export class InstructorSubscription {

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

  expertiseList = [
    'Angular',
    'React',
    'Flutter',
    'Node JS',
    'PHP',
    'Laravel',
    'Digital Marketing',
    'Web Design'
  ];

}
