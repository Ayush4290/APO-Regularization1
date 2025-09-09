import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoConsultDialog } from './apo-consult-dialog';

describe('ApoConsultDialog', () => {
  let component: ApoConsultDialog;
  let fixture: ComponentFixture<ApoConsultDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoConsultDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoConsultDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
