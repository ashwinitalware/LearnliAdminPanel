import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddState } from './add-state';

describe('AddState', () => {
  let component: AddState;
  let fixture: ComponentFixture<AddState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddState]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddState);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
