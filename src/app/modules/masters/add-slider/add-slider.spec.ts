import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSlider } from './add-slider';

describe('AddSlider', () => {
  let component: AddSlider;
  let fixture: ComponentFixture<AddSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSlider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
