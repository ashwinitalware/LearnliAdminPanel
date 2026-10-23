import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfContent } from './pdf-content';

describe('PdfContent', () => {
  let component: PdfContent;
  let fixture: ComponentFixture<PdfContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
