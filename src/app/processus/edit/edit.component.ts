import {  HostListener, Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Processus, Action, Input, Output } from '../processus';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { LogService } from '../../authentification/log.service';
import { User, LoggedUser } from '../../authentification/user';
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
  typingTimeout: number = 1000;

  @ViewChild('modal') modal: ElementRef;
  @ViewChild('inputAgentLabel') inputAgentLabel: ElementRef;

  constructor(
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
    private logService: LogService,
  ) {
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
    this.processus.owner = [this.user.uri];
  }

  ngOnChanges() {
    if (this.user == null) {
      console.log('Handle not connection');
    }
  }


  @HostListener('document:click', ['$event'])
  globalListener(event:Event)
  {
    if (event && event.target == this.modal.nativeElement) {
      this.closeModal();
    }
  }
  closeModal() {
    this.modal.nativeElement.style.display = "none";
  }

  openModal(type: string) {
    if (type === "input") {
      this.action = new Input();
    } else if (type === "output") {
      this.action = new Output();
    }
    this.action.agent = new UniqueIdentifier();
    this.modal.nativeElement.style.display = "block";
  }

  onThesaurusResult(thesaurusIdentifier: UniqueIdentifier)
  {
    this.action.agent.name = thesaurusIdentifier.name;
    this.action.agent.uri = thesaurusIdentifier.uri;
  }

  onSubmitAgent()
  {
    console.log('inSubmitAgent');
    if (this.action.agent.uri === "") return;
    // Change reference to trigger ngOnChanges
    let oldProcessus = this.processus;
    this.processus = new Processus(oldProcessus);
    switch (this.action.constructor.name) {
      case 'Input':
        this.processus.inputs.push(this.action);
        break;
      case 'Output':
        this.processus.outputs.push(this.action);
        break;
      default:
        console.log('in default');
    }
    this.closeModal();
    console.log(this.processus);
  }


}
