import { HostListener, Component, OnInit, Input, OnChanges, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { Processus, Action, ActionType, IAction, Input as pInput, Output as pOutput } from '../processus';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import {MermaidComponent } from '../../mermaid/mermaid.component';
import { ActionDisplayerService } from '../action/action-displayer.service';
import { Router,ActivatedRoute } from '@angular/router';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { SparqlClientService } from '../../sparql-client.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css', '../edit/edit.component.css'],
})
export class ViewComponent implements OnInit {

  @Input()
  editable: boolean = false;

  id: string;

  @Output()
  emittedAction: EventEmitter<Action> = new EventEmitter<Action>();

  @Input()
  processus: Processus = new Processus();
  processusGraphDefinition: string;
  inputAgents   : UniqueIdentifier[] = [];
  outputAgents  : UniqueIdentifier[] = [];
  inoutAgents   : UniqueIdentifier[] = [];

  action: Action = new Action();
  actionTypes = [];

  @ViewChild('mermaidComponent') 
  mermaidComponent: MermaidComponent;


  constructor(
    private actionDisplayerService: ActionDisplayerService,
    private _Activatedroute:ActivatedRoute,
    private _router:Router,
    private sparqlParser: SparqlParserService,
    private sparqlClient: SparqlClientService
  ) {
    let options = Object.values(ActionType);
    this.actionTypes = options;
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
   }

   ngOnInit()
   {
    if (this._Activatedroute.snapshot.params['id']) {
      this.id = this._Activatedroute.snapshot.params['id'];
      this.loadProcessus();
    }
   }


  ngOnChanges() {
    // console.log('onChange');
    console.log(this.processus);
    var inputElements = this.processus.inputs.map((input) => {
      return input.agent.uri;
    });
    var outputElements = this.processus.outputs.map((output) => {
      return output.agent.uri;
    });

    var commonIndexInput: number[] = [];
    var commonIndexOutput: number[] = [];
    inputElements.forEach((input, index) => {
      let indexInOut = outputElements.indexOf(input);
      // indexOf return -1 if no match were found
      if (indexInOut != -1) {
        commonIndexOutput.push(indexInOut);
        commonIndexInput.push(index);
      }
    })
  
    this.inputAgents    = <UniqueIdentifier[]>[];
    this.outputAgents   = <UniqueIdentifier[]>[];
    this.inoutAgents    = <UniqueIdentifier[]>[];
    commonIndexInput.forEach((commonIndex) => {
      this.inoutAgents.push(this.processus.inputs[commonIndex].agent);
    })
    this.processus.inputs.forEach((input, index) => {
      if (commonIndexInput.indexOf(index) == -1) {
        this.inputAgents.push(input.agent);
      }
    });
    this.processus.outputs.forEach((output, index) => {
      if (commonIndexOutput.indexOf(index) == -1) {
        this.outputAgents.push(output.agent);
      }
    });
    this.computeGraphDefinition();
  }

  handleSubmittedAction($event)
  {
    this.emittedAction.emit($event);
  }

  onClickNode(agent: UniqueIdentifier, actionType: ActionType) {

    let action = new Action(<IAction>{
      agent: agent,
      type: actionType
    });
    // console.log('From view component, cliked action is :')
    // console.log(action);
    this.actionDisplayerService.display(action);
    // this.thesaurus.onClickIdentifier(agent);
  }

  private _postProcess($event: any)
  {
    this.inputAgents.forEach(((input, index) => 
    {
      let node = document.getElementById('I' + index);
      node.addEventListener("click", () =>this.onClickNode(input, ActionType.INPUT));
      // node.dataset.uri 
    }));
    this.outputAgents.forEach(((output, index) => 
    {
      let node = document.getElementById('O' + index);
      node.addEventListener("click", () =>this.onClickNode(output, ActionType.OUTPUT));
    }));
    this.inoutAgents.forEach(((inout, index) => 
    {
      let node = document.getElementById('IO' + index);
      node.addEventListener("click", () =>this.onClickNode(inout, ActionType.INOUT));
    }));
  }

  computeGraphDefinition() {
    
    this.processusGraphDefinition = `
    graph RL;\n
    classDef thesaurusMermaid:hover cursor:pointer, fill:aquamarine;
  `;
    this.processusGraphDefinition += `
    This[${this.processus.name}]\n
  `;



    this.inputAgents.forEach((input, index) => {
      this.processusGraphDefinition += `I${index}("${input.name}")-->This;\n`;
      this.processusGraphDefinition += `class I${index} inputMermaid;\n`
    });

    this.outputAgents.forEach((output, index) => {
      this.processusGraphDefinition += `This-->O${index}("${output.name}");\n`;
      this.processusGraphDefinition += `class O${index} outputMermaid;\n`
    });

    this.inoutAgents.forEach((inout, index) => {
      this.processusGraphDefinition += `This-->IO${index}("${inout.name}");\n`;
      this.processusGraphDefinition += `IO${index}-->This;\n`;
      this.processusGraphDefinition += `class IO${index} inoutMermaid;\n`
    });
  }

  loadProcessus() {
    this.processus = new Processus();
    this.sparqlParser.clear();
    // this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = Processus.requiredPrefixes;

    var query = this.processus.parseSkeleton();
    
    // this.sparqlParser.order = '?uriSibling';
    this.sparqlParser.graphPattern = query;
    this.sparqlParser.graphPattern.merge(this.processus.parseRestricter('uri', [this.id]));
    this.sparqlParser.select[0] = ' DISTINCT ' + this.processus.makeBindings();
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => {
      
      this.processus = new Processus(JSON.parse(response.results.bindings[0].Processus.value));
      this.processus.actions.forEach((action) => {
        switch (action.type)
        {
          case ActionType.INPUT:
          this.processus.inputs.push(new pInput({agentUri: action.agentUri, agentLabel: action.agentLabel}));
          break;
          case ActionType.OUTPUT:
          this.processus.outputs.push(new pOutput({agentUri: action.agentUri, agentLabel: action.agentLabel}));
          break;
        }
      });
      this.ngOnChanges();
      
    }))
  }
}
