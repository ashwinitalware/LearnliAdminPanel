import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';
import { SharedModule } from '../../../shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-instructor-list',
  standalone: true,
  imports: [
    SpkReusableTables,
    SpkDropdowns,
    SharedModule,
    ReactiveFormsModule,
    QuillModule,
    NgSelectModule,
    NgbNavModule
  ],
  templateUrl: './instructor-list.html',
  styleUrls: ['./instructor-list.scss']
})
export class InstructorList implements OnInit {

  instructorForm!: FormGroup;

  qualificationList = [
    'B.E.',
    'B.Tech',
    'M.E.',
    'M.Tech',
    'BCA',
    'MCA',
    'B.Sc',
    'M.Sc'
  ];

  expertiseList = [
    'JavaScript',
    'Digital Marketing',
    'Web Development',
    'Web Design',
    'NodeJS',
    'Laravel',
    'PHP',
    'Angular',
    'React',
    'Flutter'
  ];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
  this.instructorForm = this.fb.group({
    about: [''],
    qualification: [[]],
    videoSource: ['']
  });
}

 open(content: any) {
  this.modalService.open(content, {
    centered: true,
    size: 'xl',
    fullscreen: 'lg'
  });
}

  openDeleteModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'sm'
    });
  }

  openVerifyModal(content: any) {
  this.modalService.open(content, {
    centered: true,
    size: 'sm'
  });
}

openBanModal(content: any) {
  this.modalService.open(content, {
    centered: true,
    size: 'sm'
  });
}

  onSubmit(): void {
    console.log(this.instructorForm.value);
  }
}