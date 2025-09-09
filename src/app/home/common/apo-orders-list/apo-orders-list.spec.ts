import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoOrdersList } from './apo-orders-list';

describe('ApoOrdersList', () => {
  let component: ApoOrdersList;
  let fixture: ComponentFixture<ApoOrdersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoOrdersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoOrdersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
