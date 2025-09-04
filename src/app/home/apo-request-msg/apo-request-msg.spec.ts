import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoRequestMsg } from './apo-request-msg';

describe('ApoRequestMsg', () => {
  let component: ApoRequestMsg;
  let fixture: ComponentFixture<ApoRequestMsg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoRequestMsg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoRequestMsg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
