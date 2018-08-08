import { HostListener, Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Processus, Action, Input, Output, IAction, ActionType, IProcessus } from '../processus';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { LogService } from '../../authentification/log.service';
import { Agent } from '../../authentification/user';
import { ViewComponent } from '../view/view.component';
import { ActionDisplayComponent } from '../action/display/display.component';
import { ActionDisplayerService } from '../action/action-displayer.service';
import * as $ from 'jquery';
import * as _ from 'underscore';
import {SessionStorageService} from 'ngx-webstorage';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']

})
export class EditComponent implements OnInit {
  user = new Agent;

  action: Action = new Action();
  processus: Processus = new Processus();
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
    private sessionSt:SessionStorageService,
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
    private logService: LogService,
    private actionDisplayerService: ActionDisplayerService,
  ) {
    // var values = Object.keys(Action.types).map((key) => {
    //   this.actionTypes.push({ 'key': key, 'value': Action.types[key] });
    // });

    let options = Object.values(ActionType);
    this.actionTypes = options;

    // let currentProcessus = JSON.parse(localStorage.getItem('currentProcessus'));
    let currentProcessus = JSON.parse(this.sessionSt.retrieve('currentProcessus'));
    
    if (currentProcessus) {
      this.processus = new Processus(<IProcessus>currentProcessus);
    }

    this.logService.logUpdate$.subscribe(
      value => {
        // if (value) {
        //   this.user = value;
        // }
        // console.log('log is ' + value);
        // console.log('log is ' + (value != null));

      }
    );
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
  }

  ngOnInit() {
    console.log(`
    On Init ! 
    Don't forget to properly clean old processus data
    when editing an already existing one`);

    this.action.agent = new UniqueIdentifier();
    this.processus.owners = [this.user];
    this.actionDisplayerService.oldToNewActions$.subscribe((oldAndNewAction) => 
    {
      this.handleSubmittedAction(oldAndNewAction);
    });
  }

  ngOnChanges() {
    if (this.user == null) {
      console.log('Handle not connection');
    }

    // localStorage.setItem('currentProcessus', JSON.stringify(this.processus));
  }

  ngAfterViewInit() 
  {
    console.log(this.sessionSt.retrieve('currentProcessus'));
  }

  onNameChange() {
    if (this.typingTimer < this.typingTimeout) {
      window.clearTimeout(this.typingTimer);
    }
    if (this.processus.name && this.processus.name.length >= 3) {
      this.typingTimer = window.setTimeout(() => {
        this.viewComponent.processus = this.processus;
        this.viewComponent.computeGraphDefinition();
      }, this.typingTimeout);
    }
    // localStorage.setItem('currentProcessus', JSON.stringify(this.processus));
    this.sessionSt.store('currentProcessus', JSON.stringify(this.processus));
    console.log(this.sessionSt.retrieve('currentProcessus'));
  }

  handleSubmittedAction(oldAndNewAction: [Action, Action]) {
    if (!oldAndNewAction) return;
    let oldProcessus = this.processus;
    this.processus = new Processus(oldProcessus);
    let oldAction = oldAndNewAction[0];
    this.action = oldAndNewAction[1];
    // console.log($action);
    this.deleteActionFromProcessus(oldAction);
    // console.log($action);
    // Perform deep copy
    let actionInterface = <IAction>JSON.parse(JSON.stringify(this.action));

    let checkIfActionInArray = (action: Action, actionArray: Action[]) => {
      let checker = actionArray.some((element) => {
        return action.agent.uri === element.agent.uri;
      });
      return !checker;
    };
    switch (this.action.type) {
      case ActionType.INPUT:
        if (checkIfActionInArray(this.action, this.processus.inputs)) {
          this.processus.inputs.push(new Input(actionInterface));
        }
        break;
      case ActionType.OUTPUT:
        if (checkIfActionInArray(this.action, this.processus.outputs)) {
          this.processus.outputs.push(new Output(actionInterface));
        }
        break;
      case ActionType.INOUT:
        if (checkIfActionInArray(this.action, this.processus.inputs)) {
          this.processus.inputs.push(new Input(actionInterface));
        }
        if (checkIfActionInArray(this.action, this.processus.outputs)) {
          this.processus.outputs.push(new Output(actionInterface));
        }
        break;
      default:
        console.log('in default, just deleted old action');
    }
    // localStorage.setItem('currentProcessus', JSON.stringify(this.processus));
    this.sessionSt.store('currentProcessus', JSON.stringify(this.processus));
  }

  openActionPanel() {
    this.action = new Action();
    this.action.agent = new UniqueIdentifier();
    this.action.type = ActionType.INPUT;

    this.actionDisplayerService.display(this.action);
  }
 
  save() {
    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.ADD;
    this.sparqlParser.prefixes = Processus.requiredPrefixes;
    this.processus.generateUri();
    var saveQuery = this.processus.parseIdentity();
    this.sparqlParser.graphDefinition = saveQuery;
    console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => console.log(response)));
  }

  delete() {
    if (this.processus.uri === undefined) return;
    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.DELETE;
    this.sparqlParser.prefixes = Processus.requiredPrefixes;


    var deleteOperation = this.processus.operationDelete();
    this.sparqlParser.graphDefinition = deleteOperation.quadPattern;
    this.sparqlParser.graphPattern = deleteOperation.graphPattern;
    console.log(this.sparqlParser.toString());
    // let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    // result.subscribe((response => console.log(response)));
  }

  onSubmitProcessus() {
    this.user = new Agent(JSON.parse(this.sessionSt.retrieve('user')));
    if (this.processus.owners instanceof Array && this.processus.owners[0] !== undefined ) {
      // console.log(this.user);
      this.processus.owners.reverse().pop();
      this.processus.owners.push(this.user);
    }

    // console.log(this.processus.owners instanceof Array);
    // console.log(this.processus.owners[0] !== undefined);
    // console.log(this.processus.owners[0] === '');
    // console.log(this.processus.owners === undefined);
    // console.log((this.processus.owners instanceof Array && this.processus.owners[0] !== undefined && this.processus.owners[0] === '' ));
    console.log(this.processus);
    // Add ad hoc verification ...
    this.delete();
    this.save();
  }

  deleteActionFromProcessus(oldAction: Action)
  {
    if (!oldAction) return;
    let newActions: Action[] = [];
    switch(oldAction.type) {
      case ActionType.INPUT:
      this.processus.inputs.forEach((input) => {
        if (input.agent.uri != oldAction.agent.uri) {
          newActions.push(input);
        }
      });
      this.processus.inputs = newActions;
      break;
      case ActionType.OUTPUT:
      this.processus.outputs.forEach((output) => {
        if (output.agent.uri != oldAction.agent.uri) {
          newActions.push(output);
        }
      });
      this.processus.outputs = newActions;
      break;
      case ActionType.INOUT:
      this.processus.inputs.forEach((input) => {
        if (input.agent.uri != oldAction.agent.uri) {
          newActions.push(input);
        }
      });
      this.processus.inputs = newActions;
      newActions = [];
      this.processus.outputs.forEach((output) => {
        if (output.agent.uri != oldAction.agent.uri) {
          newActions.push(output);
        }
      });
      this.processus.outputs = newActions;
      break;
    }
    oldAction = null;
  }

}
