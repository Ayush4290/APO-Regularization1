import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowApoOrderNumber } from './show-apo-order-number';

describe('ShowApoOrderNumber', () => {
  let component: ShowApoOrderNumber;
  let fixture: ComponentFixture<ShowApoOrderNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowApoOrderNumber]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowApoOrderNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
