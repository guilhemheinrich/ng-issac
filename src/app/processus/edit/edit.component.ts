import { HostListener, Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Processus, Action, Input, Output } from '../processus';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import * as $ from 'jquery';
import * as _ from 'underscore';
import { autocomplete } from 'node_modules/jquery-autocomplete/jquery.autocomplete.js';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],

})
export class EditComponent implements OnInit {

  action: Action = new Action();
  processus: Processus;


  // For the autocomplete delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 1000;

  @ViewChild('modal') modal: ElementRef;
  @ViewChild('inputAgentLabel') inputAgentLabel: ElementRef;
  private currentFocus: number;

  constructor(
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
  ) {
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
  }

  ngOnInit() {
    this.action.agent = new UniqueIdentifier();
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
    console.log(this.action.agent);
    this.modal.nativeElement.style.display = "block";
    this.currentFocus = null;
  }

  search(input: string) {
    this.sparqlParser.clear();
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = [
      GlobalVariables.ONTOLOGY_PREFIX.foaf,
      GlobalVariables.ONTOLOGY_PREFIX.issac,
      GlobalVariables.ONTOLOGY_PREFIX.skos,
    ];
    this.sparqlParser.graphPattern = new GraphDefinition([
      `
      ?uri skos:prefLabel ?label .
      FILTER regex(STR(?label), \"${input}\", \"i\") . 
      FILTER (lang(?label) = 'en') .
      `
    ]);

    // console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => 
      {
        // console.log(response);
      }));
  }

  delayedAutocomplete()
  {
    if (this.typingTimer < this.typingTimeout) {
      window.clearTimeout(this.typingTimer);
    }
    this.typingTimer = window.setTimeout(()=>{this.autocomplete()}, this.typingTimeout);
  }

  autocomplete() {
    // console.log(this.action.agentLabel);
    var parentNode = this.inputAgentLabel.nativeElement;
    // var arr = this.search(this.action.agentLabel);
  }

}
