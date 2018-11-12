import { Component, OnInit, Input } from '@angular/core';
import {Canal} from 'src/app/communication';
import { IssacAgent } from 'src/app/issac-definitions/agent';
@Component({
  selector: 'app-agent-form',
  templateUrl: './agent-form.component.html',
  styleUrls: ['./agent-form.component.css']
})
export class AgentFormComponent implements OnInit {

  public editable = false;  
  public displayModal = false;
  public agent: IssacAgent;

  @Input()
  canal: Canal<IssacAgent> = new Canal<IssacAgent>();

  constructor() { }

  ngOnInit() {
    this.canal.flowIn$.subscribe((agentAndOptions) => {
      if (!agentAndOptions) return;
      this.agent = agentAndOptions.data;
      console.log(agentAndOptions);
      (<{editable}>agentAndOptions.options).editable ? this.editable = true : this.editable = false;
      this.displayModal = true;
    })
  }

  onThesaurusResult(thesaurusIdentifier: {name, uri}) {
    this.agent.label = thesaurusIdentifier.name;
    this.agent.uri = thesaurusIdentifier.uri;
  }

  onSubmitAgent() {
    this.displayModal = false;
    this.canal.passOut(this.agent);
  }

}
