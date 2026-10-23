import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-state',
  imports: [SpkReusableTables, FormsModule],
  templateUrl: './add-state.html',
  styleUrl: './add-state.scss'
})

export class AddState implements OnInit {
  states: any[] = [];
  selectedState: any = null;
  // 
  private apiUrl = `${environment.apiUrl}/states`;
  // private apiUrl = 'http://localhost:3000/api/v1/states';

  constructor(
    private modalService: NgbModal,
    private http: HttpClient,
    private toastr: ToastrService,
    
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadStates();
  }

  loadStates(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.states = res.data;
          this.cdr.detectChanges(); // Trigger change detection for zoneless mode
        } else {
          this.toastr.error('Failed to load states.', 'Error');
        }
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.toastr.error('Server error while fetching states.', 'Error');
      }
    });
  }

  openView(state: any, content: any): void {
    this.selectedState = state;
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  showRestrictedToast(): void {
    this.toastr.info('Write operations for states are restricted (read-only API).', 'Info');
  }
}