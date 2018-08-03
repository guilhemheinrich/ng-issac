import { Component, OnInit } from '@angular/core';
import {Processus} from '../processus';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  processusList: Processus[];

  private _myuri

  constructor(
    private sparqlParser: SparqlParserService,) {
    // this.myuri.value = 'http://hello';
  }

  ngOnInit() {
    this.searchAllProcessus();
  }

  searchAllProcessus ()
  {
    let processus = new Processus();
    console.log(processus);
    console.log(processus.processBindings());
    processus.name = 'new';

    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = Processus.requiredPrefixes;

    var query = processus.parseSkeleton();
    var filter = processus.parseFilter();
    query.merge(filter);
    query.merge(processus.parseGather('toto'));
    this.sparqlParser.graphPattern = query;
    // console.log(this.sparqlParser.toString());
    // console.log(this.sparqlParser);
    // let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    // result.subscribe((response => console.log(response)));
  }
}
