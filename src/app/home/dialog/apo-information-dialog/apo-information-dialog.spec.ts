import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoInformationDialog } from './apo-information-dialog';

describe('ApoInformationDialog', () => {
  let component: ApoInformationDialog;
  let fixture: ComponentFixture<ApoInformationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoInformationDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoInformationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
