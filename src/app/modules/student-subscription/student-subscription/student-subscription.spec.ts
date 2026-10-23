import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSubscription } from './student-subscription';

describe('StudentSubscription', () => {
  let component: StudentSubscription;
  let fixture: ComponentFixture<StudentSubscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSubscription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSubscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
