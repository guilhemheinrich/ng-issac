import { TestBed, inject } from '@angular/core/testing';

import { ProcessusService } from './processus.service';

describe('ProcessusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessusService]
    });
  });

  it('should be created', inject([ProcessusService], (service: ProcessusService) => {
    expect(service).toBeTruthy();
  }));
});
