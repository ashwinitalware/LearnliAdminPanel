import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';

@Component({
  selector: 'app-levels',
  imports: [SpkReusableTables, SpkDropdowns],
  templateUrl: './levels.html',
  styleUrl: './levels.scss'
})
export class Levels {
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
