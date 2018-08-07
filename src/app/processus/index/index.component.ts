import { Component, OnInit } from '@angular/core';
import {Processus, Action} from '../processus';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { SparqlClientService } from '../../sparql-client.service';
import { Agent } from '../../authentification/user';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  // For the filter delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 500;

  processusList: Processus[];
  processusFilter: Processus = new Processus();
  filter: {
    owner: string,
    name: string,
    action:string
  } = {
    owner: "",
    name: "",
    action: ""
  };
  public searchField:string;


  constructor(
    private sparqlParser: SparqlParserService,
    private sparqlClient: SparqlClientService) {

  }

  ngOnInit() {
    this.searchAllProcessus();
  }

  // A mettre dans un innerHtml html tag attribute !
  myMapping(element: Agent, index: number, arr: Array<Agent>): string {
    let htmlOutput = `<div class="tooltip">${element.username}
                        <span class="tooltiptext">${element.email}</span>
                      </div>`;
    return htmlOutput;
  }


  handleFilter($event: Event)
  {
    if (this.typingTimer < this.typingTimeout) {
      window.clearTimeout(this.typingTimer);
    }
    if (this.processusFilter) {
      this.typingTimer = window.setTimeout(() => { 
        this.processusFilter = new Processus();
        this.processusFilter.name = this.filter.name;
        this.processusFilter.owners.push(new Agent({username: this.filter.owner}));
        this.processusFilter.actions.push(new Action({agentLabel: this.filter.action}));
        console.log(this.processusFilter);
        this.searchAllProcessus();
      }, this.typingTimeout);
    }
    
  }
  searchAllProcessus()
  {
    this.sparqlParser.clear();
    // this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
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
