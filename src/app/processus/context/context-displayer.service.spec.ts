import { TestBed, inject } from '@angular/core/testing';

import { ContextDisplayerService } from './context-displayer.service';

describe('ContextDisplayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContextDisplayerService]
    });
  });

  it('should be created', inject([ContextDisplayerService], (service: ContextDisplayerService) => {
    expect(service).toBeTruthy();
  }));
});
