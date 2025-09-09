import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApoOrders } from './apo-orders';

describe('ApoOrders', () => {
  let component: ApoOrders;
  let fixture: ComponentFixture<ApoOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApoOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
