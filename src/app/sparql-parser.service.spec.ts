import { TestBed, inject } from '@angular/core/testing';

import { SparqlParserService } from './sparql-parser.service';

describe('SparqlParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SparqlParserService]
    });
  });

  it('should be created', inject([SparqlParserService], (service: SparqlParserService) => {
    expect(service).toBeTruthy();
  }));
});
