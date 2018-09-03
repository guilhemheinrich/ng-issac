import { TestBed, inject } from '@angular/core/testing';

import { ProcessusHandlerService } from './processus-handler.service';

describe('ProcessusHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessusHandlerService]
    });
  });

  it('should be created', inject([ProcessusHandlerService], (service: ProcessusHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
