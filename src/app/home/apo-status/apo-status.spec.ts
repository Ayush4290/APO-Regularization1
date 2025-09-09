import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoStatus } from './apo-status';

describe('ApoStatus', () => {
  let component: ApoStatus;
  let fixture: ComponentFixture<ApoStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
