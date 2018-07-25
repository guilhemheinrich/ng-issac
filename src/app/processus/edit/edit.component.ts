import { HostListener, Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Processus, Action, Input, Output, IAction } from '../processus';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { LogService } from '../../authentification/log.service';
import { LoggedUser } from '../../authentification/user';
import { ViewComponent } from '../view/view.component';
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

  constructor(
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
    private logService: LogService,
  ) {
    var values = Object.keys(Action.types).map((key) => {
      this.actionTypes.push({ 'key': key, 'value': Action.types[key] });
    });
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
    this.action.agent = new UniqueIdentifier();
    this.processus.owners = [this.user.uri];
  }

  ngOnChanges() {
    if (this.user == null) {
      console.log('Handle not connection');
    }
  }


  @HostListener('document:click', ['$event'])
  globalListener(event: Event) {
    if (event && event.target == this.modal.nativeElement) {
      this.closeModal();
    }
  }
  closeModal() {
    this.modal.nativeElement.style.display = "none";
  }

  openModal() {
    this.action = new Action();
    this.action.agent = new UniqueIdentifier();
    this.modal.nativeElement.style.display = "block";
  }

  onThesaurusResult(thesaurusIdentifier: UniqueIdentifier) {
    this.action.agent.name = thesaurusIdentifier.name;
    this.action.agent.uri = thesaurusIdentifier.uri;
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
  }

  onSubmitAgent() {
    if (this.action.agent.uri === "") return;
    // Change reference to trigger ngOnChanges

    let oldProcessus = this.processus;
    this.processus = new Processus(oldProcessus);
    // Perform deep copy
    let actionInterface = <IAction>JSON.parse(JSON.stringify(this.action));

    let checkIfActionInArray = (action: Action, actionArray: Action[]) => {
      let checker = actionArray.some((element) => {
        return action.agent.uri === element.agent.uri;
      });
      return !checker;
    };

    switch (this.action.type) {
      case Action.types.INPUT:
      // if (this.processus.inputs.some)
        if (checkIfActionInArray(this.action, this.processus.inputs)) {
          this.processus.inputs.push(new Input(actionInterface));
        }
        break;
      case Action.types.OUTPUT:
        if (checkIfActionInArray(this.action, this.processus.outputs)) {
          this.processus.outputs.push(new Output(actionInterface));
        }
        break;
      case Action.types.INOUT:
        if (checkIfActionInArray(this.action, this.processus.inputs)) {
          this.processus.inputs.push(new Input(actionInterface));
        }
        if (checkIfActionInArray(this.action, this.processus.outputs)) {
          this.processus.outputs.push(new Output(actionInterface));
        }
        break;
      default:
        console.log('in default');
    }

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

}
