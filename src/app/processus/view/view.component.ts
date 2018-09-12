import { HostListener, Component, OnInit, Input, OnChanges, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { Processus, Action, ActionType, IAction, Input as pInput, Output as pOutput } from '../processus';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import {MermaidComponent } from '../../mermaid/mermaid.component';
import { AgentDisplayerService } from '../action/agent-displayer.service';
import { Router,ActivatedRoute } from '@angular/router';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { SparqlClientService } from '../../sparql-client.service';
import {IssacAgent, IIssacAgent} from 'src/app/issac-definitions/agent';
import {IssacProcessus, IIssacProcessus} from 'src/app/issac-definitions/processus';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css', '../edit/edit.component.css'],
})
export class ViewComponent implements OnInit {

  @Input()
  editable: boolean = false;

  @Input()
  id: string;

  @Output()
  emittedAgent: EventEmitter<IssacAgent> = new EventEmitter<IssacAgent>();

  @Input()
  processus: IssacProcessus = new IssacProcessus();
  processusGraphDefinition: string;


  @ViewChild('mermaidComponent') 
  mermaidComponent: MermaidComponent;


  constructor(
    private agentDisplayerService: AgentDisplayerService,
    private _Activatedroute:ActivatedRoute,
    private _router:Router,
    private sparqlParser: SparqlParserService,
    private sparqlClient: SparqlClientService
  ) {
    let options = Object.values(ActionType);
    // this.actionTypes = options;
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
   }

   ngOnInit()
   {
    if (!this.id && this.processus && this.processus.uri) {
      this.id = this.processus.uri;
    }
    // console.log(this._Activatedroute.snapshot.url);
    let urlFragments = this._Activatedroute.snapshot.url;
    if (this._Activatedroute.snapshot.params['id'] && 
    urlFragments[0].path == 'processus' && urlFragments[1].path == 'view') {
      this.id = this._Activatedroute.snapshot.params['id'];
      this.loadProcessus();
    }
   }


  ngOnChanges() {
    if (!this.id && this.processus && this.processus.uri) {
      this.id = this.processus.uri;
    }
    console.log(this.processus);
    this.computeGraphDefinition();
  }

  handleSubmittedAgent($event)
  {
    this.emittedAgent.emit($event);
  }

  onClickNode(agent: IssacAgent) {
    this.agentDisplayerService.display(agent, true);
  }

  private _postProcess($event: any)
  {
    this.processus.agents.forEach(((agent, index) => 
    {
      let node = document.getElementById('A' + index);
      node.addEventListener("click", () =>this.onClickNode(agent));
      // node.dataset.uri 
    }));

  }

  computeGraphDefinition() {

    this.processusGraphDefinition = `
    graph RL;\n
    classDef thesaurusMermaid:hover cursor:pointer, fill:aquamarine;
  `;
    this.processusGraphDefinition += `
    This[${this.processus.label}]\n
  `;
  this.processus.agents.forEach((agent, index) => {
    this.processusGraphDefinition += `A${index}("${agent.label}")-->This;\n`;
    this.processusGraphDefinition += `class I${index} inputMermaid;\n`
  });
  console.log(this.processusGraphDefinition);

  }

  loadProcessus() {
    console.log('inside loadProcessus');
    this.processus = new IssacProcessus();
    this.sparqlParser.clear();
    // this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = Processus.requiredPrefixes;

    var query = this.processus.parseSkeleton();
    
    // this.sparqlParser.order = '?uriSibling';
    this.sparqlParser.graphPattern = query;
    this.sparqlParser.graphPattern.merge(this.processus.parseRestricter('uri', [this.id]));
    this.sparqlParser.select[0] = ' DISTINCT ' + this.processus.makeBindings();
    // console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => {
      
      this.processus = new IssacProcessus(JSON.parse(response.results.bindings[0].IssacProcessus.value));
      this.ngOnChanges();
      
    }))
  }
}
