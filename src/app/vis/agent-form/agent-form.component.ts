import { Component, OnInit, Input } from '@angular/core';

import {Canal} from 'src/app/communication';
// import { IssacAgent } from 'src/app/issac-definitions/agent';
import { Agent } from 'src/app/models/Agent';
@Component({
  selector: 'app-agent-form',
  templateUrl: './agent-form.component.html',
  styleUrls: ['./agent-form.component.css']
})
export class AgentFormComponent implements OnInit {

  public editable = false;  
  public displayModal = false;
  public options: {};
  public agent: Agent;

  @Input()
  canal: Canal<Agent> = new Canal<Agent>();

  constructor() { }

  ngOnInit() {
    this.canal.flowIn$.subscribe((agentAndOptions) => {
      if (!agentAndOptions) return;
      this.agent = agentAndOptions.data;
      this.options = agentAndOptions.options;
      (<{editable}>agentAndOptions.options).editable ? this.editable = true : this.editable = false;

      this.displayModal = true;
    })
  }



  onThesaurusResult(thesaurusIdentifier: {name, uri, synonyms}) {
    this.agent.prefLabel = thesaurusIdentifier.name;
    this.agent.altLabels = thesaurusIdentifier.synonyms;
    this.agent.uri = thesaurusIdentifier.uri;
  }

  onSubmitAgent() {
    this.displayModal = false;
    this.canal.passOut(this.agent, {editedAgent: this.options});
  }

}
