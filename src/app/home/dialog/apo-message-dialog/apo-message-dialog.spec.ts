import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoMessageDialog } from './apo-message-dialog';

describe('ApoMessageDialog', () => {
  let component: ApoMessageDialog;
  let fixture: ComponentFixture<ApoMessageDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoMessageDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoMessageDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
