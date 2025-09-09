import { TestBed } from '@angular/core/testing';

import { DashboardResolver } from './dashboard-resolver';

describe('DashboardResolver', () => {
  let service: DashboardResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardResolver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
