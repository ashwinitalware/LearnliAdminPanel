import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-city',
  imports: [SpkReusableTables, FormsModule],
  templateUrl: './add-city.html',
  styleUrl: './add-city.scss'
})
export class AddCity implements OnInit {
  states: any[] = [];
  cities: any[] = [];
  selectedStateId: number | null = null;
  selectedCityId: any = '';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStates();
  }

  // 1. Fetch all states on init
  loadStates() {
    this.http.get<any>(`${environment.apiUrl}/states`).subscribe({
      next: (response) => {
        if (response.success) {
          this.states = response.data;
          // Pre-select first state if available
          if (this.states.length > 0) {
            this.selectedStateId = this.states[0].id;
            this.loadCities(this.selectedStateId);
          }
          this.cdr.detectChanges(); // Trigger change detection
        }
      },
      error: (err) => console.error('Error fetching states:', err)
    });
  }

  // 2. Fetch cities when a state is selected in the dropdown
  onStateChange(event: any) {
    const val = event?.target?.value;
    const stateId = val ? Number(val) : null;
    this.selectedStateId = stateId;
    this.selectedCityId = ''; // reset selected city
    if (stateId) {
      this.loadCities(stateId);
    } else {
      this.cities = [];
      this.cdr.detectChanges();
    }
  }

  loadCities(stateId: any): void {
    if (!stateId) {
      this.cities = [];
      return;
    }
    this.http.get<any>(`${environment.apiUrl}/cities/state/${stateId}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.cities = response.data;
          this.cdr.detectChanges(); // Trigger change detection
        }
      },
      error: (err) => console.error('Error fetching cities:', err)
    });
  }

  getStateName(stateId: any): string {
    const state = this.states.find(s => s.id === Number(stateId));
    return state ? state.state_name : '-';
  }
}