import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoRequest } from './apo-request';

describe('ApoRequest', () => {
  let component: ApoRequest;
  let fixture: ComponentFixture<ApoRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
