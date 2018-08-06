import { Component, OnInit } from '@angular/core';
import {Processus} from '../processus';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { SparqlClientService } from '../../sparql-client.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  processusList: Processus[];
  processusFilter: Processus = new Processus();
  public searchField:string;
  jsonPattern = {
    "owners": '{{value}}'
  };

  constructor(
    private sparqlParser: SparqlParserService,
    private sparqlClient: SparqlClientService) {
    // this.myuri.value = 'http://hello';
  }

  ngOnInit() {
    this.searchAllProcessus();
  }

  searchAllProcessus()
  {
    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = Processus.requiredPrefixes;

    var query = this.processusFilter.parseSkeleton();
    var filter = this.processusFilter.parseFilter();
    query.merge(filter);
    var gather = this.processusFilter.parseGather(this.searchField, query);
    
    this.sparqlParser.graphPattern = gather;
    this.sparqlParser.select[0] = this.processusFilter.makeBindings();
    console.log(this.sparqlParser.toString());
    console.log(this.sparqlParser);
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => {
      console.log(response.results.bindings);
      let allProcessus = response.results.bindings;
      this.processusList = [];
      <Array<any>>allProcessus.forEach((processusJSON) => {
        this.processusList.push(new Processus(JSON.parse(processusJSON.Processus.value)));
      })
      this.processusList.forEach((processus) => {
        processus.generateInputsOutputsFromActions();
      })
    }))
  }
}
