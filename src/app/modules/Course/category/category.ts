import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';

@Component({
  selector: 'app-category',
  imports: [SpkReusableTables, SpkDropdowns],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category {

  constructor(private modalService: NgbModal) {}

  open(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  openDeleteModal(content: any) {
  this.modalService.open(content, {
    centered: true,
    size: 'sm'
  });
}
}