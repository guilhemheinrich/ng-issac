import { HostListener, Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
// import { Processus, Action, Input, Output, IAction, ActionType, IProcessus } from '../processus';
import {IssacProcessus, IIssacProcessus} from 'src/app/issac-definitions/processus';
import {IssacAgent, IIssacAgent} from 'src/app/issac-definitions/agent';

import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { LogService } from '../../authentification/log.service';
import { Agent } from '../../authentification/user';
import { ViewComponent } from '../view/view.component';
import { ActionDisplayComponent } from '../action/display/display.component';
import { AgentDisplayerService } from '../action/agent-displayer.service';
import { ProcessusHandlerService } from '../processus-handler.service';
import * as $ from 'jquery';
import * as _ from 'underscore';
import { SessionStorageService } from 'ngx-webstorage';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']

})
export class EditComponent implements OnInit {

  /*
  id is the uri of the process, in case we come here from the router/:id path
  */
  id: string;

  user = new Agent;

  agent: IssacAgent = new IssacAgent();
  processus: IssacProcessus = new IssacProcessus();
  change: boolean = false;

  // For the autocomplete delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 500;

  actionTypes = [];

  @ViewChild('modal') modal: ElementRef;
  // @ViewChild('inputAgentLabel') inputAgentLabel: ElementRef;
  @ViewChild('viewComponent') viewComponent: ViewComponent;
  @ViewChild('actionComponent') actionComponent: ActionDisplayComponent;

  constructor(
    private router: Router,
    private sessionSt: SessionStorageService,
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
    private logService: LogService,
    private agentDisplayerService: AgentDisplayerService,
    private processusHandlerService: ProcessusHandlerService,
    private _Activatedroute: ActivatedRoute,
  ) {


    // let options = Object.values(ActionType);
    // this.actionTypes = options;

    // let currentProcessus = JSON.parse(localStorage.getItem('currentProcessus'));
    // let currentProcessus = JSON.parse(this.sessionSt.retrieve('currentProcessus'));

    // if (currentProcessus) {
    //   this.processus = new IssacProcessus(<IProcessus>currentProcessus);
    // }

    this.logService.logUpdate$.subscribe(
      value => {

      }
    );
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
  }

  ngOnInit() {
    console.log(`
    On Init ! 
    Don't forget to properly clean old processus data
    when editing an already existing one`);

    if (this._Activatedroute.snapshot.params['id']) {
      this.id = this._Activatedroute.snapshot.params['id'];
      this.loadIssacProcessus();
    }

    // this.action.agent = new UniqueIdentifier();
    this.processus.owners = [this.user];
    this.agentDisplayerService.oldToNewAgent$.subscribe((oldAndNewAgent) => {
      this.handleSubmittedAgent(oldAndNewAgent);
      this.viewComponent.ngOnChanges();
    });

    this.processusHandlerService.currentProcessus$.subscribe((processus) => {
      this.processus = new IssacProcessus(processus);
      this.viewComponent.ngOnChanges();
    })
  }

  ngOnChanges() {
  }

  ngAfterViewInit() {
  }

  onNameChange() {
    if (this.typingTimer < this.typingTimeout) {
      window.clearTimeout(this.typingTimer);
    }
    if (this.processus.label && this.processus.label.length >= 3) {
      this.typingTimer = window.setTimeout(() => {
        this.viewComponent.processus = this.processus;
        this.viewComponent.computeGraphDefinition();
      }, this.typingTimeout);
    }
    this.sessionSt.store('currentProcessus', JSON.stringify(this.processus));

  }

  handleSubmittedAgent(oldAndNewAgent: [IssacAgent, IssacAgent]) {
    if (!oldAndNewAgent) return;
    let oldAgent = oldAndNewAgent[0];
    this.agent = oldAndNewAgent[1];
    // // console.log($action);
    this.deleteAgentFromIssacProcessus(oldAgent);
    this.processus.agents.push(new IssacAgent(this.agent));
    this.processus.purgeAgents();
    console.log(this.processus);

    this.viewComponent.ngOnChanges();
    this.sessionSt.store('currentProcessus', JSON.stringify(this.processus));
  }

  openAgentPanel() {
    this.agent = new IssacAgent();

    this.agentDisplayerService.display(this.agent, false);
  }

  save() {
    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.ADD;
    this.sparqlParser.prefixes = IssacProcessus.requiredPrefixes;
    this.processus.generateUri();
    
    var saveQuery = this.processus.parseIdentity();
    this.sparqlParser.graphDefinition = saveQuery;
    // console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    return result;
    // result.subscribe((response => console.log(response)));
  }

  delete() {
    if (this.processus.uri === undefined) return;
    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.DELETE;
    this.sparqlParser.prefixes = IssacProcessus.requiredPrefixes;


    var deleteOperation = this.processus.operationDelete();
    this.sparqlParser.graphDefinition = deleteOperation.quadPattern;
    this.sparqlParser.graphPattern = deleteOperation.graphPattern;
    // console.log( this.sparqlParser.toString()); 
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    return result;

  }

  onSubmitProcessus() {
    this.user = new Agent(JSON.parse(this.sessionSt.retrieve('user')));
    if (this.processus.owners instanceof Array && this.processus.owners[0] !== undefined) {
      this.processus.owners.reverse().pop();
      this.processus.owners.push(this.user);
    } else {
      this.processus.owners = [];
      this.processus.owners.push(this.user);
    }
    console.log(this.processus);
    // this.processus.generateActionsFromInputsAndOutputs();
    // Add ad hoc verification ...
    let deleteObservable = this.delete();
    // deleteObservable exists <=> this.processus.uri exists
    let saveObservable = this.save();
    if (deleteObservable) {
      // We chain subscribing here to avoid deleting before inserting ...
      deleteObservable.subscribe((response => {
        // console.log(response);
        saveObservable.subscribe((response) => console.log(response));
        this.router.navigate(['processus/index']);

      }));
    } else {
      saveObservable.subscribe((response) => {
        // console.log(response);
        this.router.navigate(['processus/index']);
      });
    }
  }

  deleteAgentFromIssacProcessus(oldAgent: IssacAgent) {
    if (!oldAgent) return;
    let newAgents: IssacAgent[] = [];
    this.processus.agents.forEach((agent) => {
      if ( agent.uri != oldAgent.uri) {
        newAgents.push(agent);
      }
    });
    this.processus.agents = newAgents;
  }


  loadIssacProcessus() {
    this.processus = new IssacProcessus();
    this.sparqlParser.clear();
    // this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = IssacProcessus.requiredPrefixes;

    var query = this.processus.parseSkeleton();

    // this.sparqlParser.order = '?uriSibling';
    this.sparqlParser.graphPattern = query;
    this.sparqlParser.graphPattern.merge(this.processus.parseRestricter('uri', [this.id]));
    this.sparqlParser.select[0] = ' DISTINCT ' + this.processus.makeBindings();
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => {
      this.processus = new IssacProcessus(JSON.parse(response.results.bindings[0].IssacProcessus.value));
    }))
  }



}
