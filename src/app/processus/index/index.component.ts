import { Component, OnInit } from '@angular/core';
import {IssacProcessus, IIssacProcessus} from 'src/app/issac-definitions/processus';
import {IssacAgent, IIssacAgent} from 'src/app/issac-definitions/agent';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { SparqlClientService } from '../../sparql-client.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { Agent } from '../../authentification/user';
import {SessionStorageService} from 'ngx-webstorage';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  // For the filter delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 500;

  processusList: IssacProcessus[];
  processusFilter: IssacProcessus = new IssacProcessus();
  filter: {
    owner: string,
    label: string,
    agentLabel:string
  } = {
    owner: "",
    label: "",
    agentLabel: ""
  };
  public searchField:string;


  constructor(
    private sparqlParser: SparqlParserService,
    private sparqlClient: SparqlClientService,
    private sessionSt:SessionStorageService,) {
      this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
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
        this.processusFilter = new IssacProcessus();
        this.processusFilter.label = this.filter.label;
        this.processusFilter.owners.push(new Agent({username: this.filter.owner}));
        this.processusFilter.agents.push(new IssacAgent({label: this.filter.agentLabel}));
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
    this.sparqlParser.prefixes = IssacProcessus.requiredPrefixes;

    var query = this.processusFilter.parseSkeleton();
    var filter = this.processusFilter.parseFilter();
    query.merge(filter);
    var gather = this.processusFilter.parseGather(this.searchField, query);
    
    this.sparqlParser.graphPattern = gather;
    this.sparqlParser.select[0] = ' DISTINCT ' + this.processusFilter.makeBindings();
    console.log(this.sparqlParser.toString());
    console.log(this.sparqlParser);
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => {
      console.log(response.results.bindings);
      let allProcessus = response.results.bindings;
      this.processusList = [];
      <Array<any>>allProcessus.forEach((processusJSON) => {
        this.processusList.push(new IssacProcessus(JSON.parse(processusJSON.Processus.value)));
      })

    }))
  }

  isProcessusOwned(processus: IssacProcessus) {
    let loggedUser = new Agent(JSON.parse(this.sessionSt.retrieve('user')));
    return processus.owners.some((owner) => {
      return owner.uri == loggedUser.uri;
    });
  }
}
