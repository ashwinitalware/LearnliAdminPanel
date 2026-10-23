import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSponsorBanner } from './add-sponsor-banner';

describe('AddSponsorBanner', () => {
  let component: AddSponsorBanner;
  let fixture: ComponentFixture<AddSponsorBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSponsorBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSponsorBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
