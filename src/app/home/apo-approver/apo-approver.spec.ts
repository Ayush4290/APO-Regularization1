import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoApprover } from './apo-approver';

describe('ApoApprover', () => {
  let component: ApoApprover;
  let fixture: ComponentFixture<ApoApprover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoApprover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoApprover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
