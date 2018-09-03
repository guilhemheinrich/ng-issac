import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Action } from '../processus';

@Injectable({
  providedIn: 'root'
})
export class ActionDisplayerService {
  public displayIn$: BehaviorSubject<{'action' : Action, 'editable' : boolean}> = new BehaviorSubject(null);
  public oldToNewActions$: BehaviorSubject<[Action, Action]> = new BehaviorSubject<[Action, Action]>(null);

  constructor() { }

  display(action: Action, editable = false)
  {
    this.displayIn$.next({'action' : action, 'editable' : editable});
  }

  output(oldAction: Action, action: Action)
  {
    this.oldToNewActions$.next([oldAction, action]);
  }



}
