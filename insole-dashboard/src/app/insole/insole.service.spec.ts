import { TestBed } from '@angular/core/testing';

import { InsoleService } from './insole.service';

describe('InsoleService', () => {
  let service: InsoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
