import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {IssacAgent} from 'src/app/issac-definitions/agent';

@Injectable({
  providedIn: 'root'
})
export class AgentDisplayerService {
  public displayIn$: BehaviorSubject<{'agent' : IssacAgent, 'editable' : boolean}> = new BehaviorSubject(null);
  public oldToNewAgent$: BehaviorSubject<[IssacAgent, IssacAgent]> = new BehaviorSubject<[IssacAgent, IssacAgent]>(null);

  constructor() { }

  display(agent: IssacAgent, editable = false)
  {
    this.displayIn$.next({'agent' : agent, 'editable' : editable});
  }

  output(oldAgent: IssacAgent, agent: IssacAgent)
  {
    this.oldToNewAgent$.next([oldAgent, agent]);
  }



}
