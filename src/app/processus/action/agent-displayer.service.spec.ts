import { TestBed, inject } from '@angular/core/testing';

import { AgentDisplayerService } from './agent-displayer.service';

describe('AgentDisplayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgentDisplayerService]
    });
  });

  it('should be created', inject([AgentDisplayerService], (service: AgentDisplayerService) => {
    expect(service).toBeTruthy();
  }));
});
