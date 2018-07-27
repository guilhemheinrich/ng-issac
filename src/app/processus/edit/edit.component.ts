import { HostListener, Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Processus, Action, Input, Output, IAction, ActionType } from '../processus';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { LogService } from '../../authentification/log.service';
import { LoggedUser } from '../../authentification/user';
import { ViewComponent } from '../view/view.component';
import { ActionDisplayComponent } from '../action/display/display.component';
import { ActionDisplayerService } from '../action/action-displayer.service';
import * as $ from 'jquery';
import * as _ from 'underscore';
import { autocomplete } from 'node_modules/jquery-autocomplete/jquery.autocomplete.js';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']

})
export class EditComponent implements OnInit {
  user = new LoggedUser;

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

    this.logService.log$.subscribe(
      value => {
        if (value) {
          this.user = value;
        }
        console.log('log is ' + value);
        console.log('log is ' + (value != null));
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
    this.processus.owners = [this.user.uri];
    this.actionDisplayerService.oldToNewActions$.subscribe((oldAndNewAction) => 
    {
      this.handleSubmittedAction(oldAndNewAction);
    });
  }

  ngOnChanges() {
    if (this.user == null) {
      console.log('Handle not connection');
    }
  }


  // @HostListener('document:click', ['$event'])
  // globalListener(event: Event) {
  //   if (event && event.target == this.modal.nativeElement) {
  //     this.closeModal();
  //   }
  // }
  // closeModal() {
  //   this.modal.nativeElement.style.display = "none";
  // }

  // openModal() {
  //   this.action = new Action();
  //   this.action.agent = new UniqueIdentifier();
  //   this.modal.nativeElement.style.display = "block";
  // }

  // onThesaurusResult(thesaurusIdentifier: UniqueIdentifier) {
  //   this.action.agent.name = thesaurusIdentifier.name;
  //   this.action.agent.uri = thesaurusIdentifier.uri;
  // }

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
      // console.log(this.processus.inputs);
      // console.log(this.processus.outputs);
  }

  openActionPanel() {
    this.action = new Action();
    this.action.agent = new UniqueIdentifier();
    this.action.type = ActionType.INPUT;
    // console.log('From open Action Panel ');
    // console.log(this.action);
    // this.actionComponent.openModal(this.action);
    this.actionDisplayerService.display(this.action);
  }
 
  save() {
    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.ADD;
    this.sparqlParser.prefixes = Processus.requiredPrefixes;

    var saveQuery = this.processus.parseDefinition();
    this.sparqlParser.graphDefinition = saveQuery;
    console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => console.log(response)));
  }

  delete() {
    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.DELETE;
    this.sparqlParser.prefixes = Processus.requiredPrefixes;

    var saveQuery = this.processus.parseDefinition();
    this.sparqlParser.graphDefinition = saveQuery;
    console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => console.log(response)));
  }

  onSubmitProcessus() {
    if (!this.processus.owners || this.processus.owners === ['']) {
      this.processus.owners.push(this.user.uri);
    }

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
