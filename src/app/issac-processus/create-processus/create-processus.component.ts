import { Component, OnInit } from '@angular/core';
import { Agent } from '../../authentification/user';
import { IssacProcessus } from 'src/app/issac-definitions/processus';
import { IssacAgent } from 'src/app/issac-definitions/agent';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import { LogService } from '../../authentification/log.service';
import { SessionStorageService } from 'ngx-webstorage';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-create-processus',
  templateUrl: './create-processus.component.html',
  styleUrls: ['./create-processus.component.css']
})
export class CreateProcessusComponent implements OnInit {
  /*
  processusUri is the uri of the processus, in case we come here from the router/:id path
  */
  processusUri?: string;

  //  user: Agent;

  //  agent: IssacAgent;
  processus: IssacProcessus;

  agentPanelVisibility = false;
  // For the autocomplete delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 500;

  constructor(
    private router: Router,
    private sessionSt: SessionStorageService,
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
    private logService: LogService,
    private _Activatedroute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.processus = new IssacProcessus();
  }

  onNameChange() {
    if (this.typingTimer < this.typingTimeout) {
      window.clearTimeout(this.typingTimer);
    }
    if (this.processus.label && this.processus.label.length >= 3) {
      this.typingTimer = window.setTimeout(() => {
        // this.viewComponent.processus = this.processus;
        // this.viewComponent.computeGraphDefinition();
      }, this.typingTimeout);
    }
    this.sessionSt.store('currentProcessus', JSON.stringify(this.processus));
  }

  openAgentPanel() {
    
  }
}
