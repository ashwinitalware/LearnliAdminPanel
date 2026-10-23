import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpkReusableTables } from '../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [SpkReusableTables, SpkDropdowns],
  templateUrl: './enrollments.html',
  styleUrl: './enrollments.scss'
})
export class Enrollments {

  imagePreview: string | ArrayBuffer | null = null;

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

  onImageSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreview = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }
}