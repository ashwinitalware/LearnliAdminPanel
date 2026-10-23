import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorSubscription } from './instructor-subscription';

describe('InstructorSubscription', () => {
  let component: InstructorSubscription;
  let fixture: ComponentFixture<InstructorSubscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorSubscription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorSubscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
