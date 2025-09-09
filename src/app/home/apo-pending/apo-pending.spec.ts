import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoPending } from './apo-pending';

describe('ApoPending', () => {
  let component: ApoPending;
  let fixture: ComponentFixture<ApoPending>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoPending]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoPending);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
