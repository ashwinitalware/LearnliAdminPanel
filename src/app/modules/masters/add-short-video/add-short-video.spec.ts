import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddShortVideo } from './add-short-video';

describe('AddShortVideo', () => {
  let component: AddShortVideo;
  let fixture: ComponentFixture<AddShortVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddShortVideo]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddShortVideo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
