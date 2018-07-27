import { TestBed, inject } from '@angular/core/testing';

import { ActionDisplayerService } from './action-displayer.service';

describe('ActionDisplayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActionDisplayerService]
    });
  });

  it('should be created', inject([ActionDisplayerService], (service: ActionDisplayerService) => {
    expect(service).toBeTruthy();
  }));
});
