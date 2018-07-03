import { TestBed, inject } from '@angular/core/testing';

import { SparqlClientService } from './sparql-client.service';

describe('SparqlClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SparqlClientService]
    });
  });

  it('should be created', inject([SparqlClientService], (service: SparqlClientService) => {
    expect(service).toBeTruthy();
  }));
});
