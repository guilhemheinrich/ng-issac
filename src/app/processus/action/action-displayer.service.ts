import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Action } from '../processus';

@Injectable({
  providedIn: 'root'
})
export class ActionDisplayerService {
  public displayIn$: BehaviorSubject<Action> = new BehaviorSubject<Action>(null);
  public oldToNewActions$: BehaviorSubject<[Action, Action]> = new BehaviorSubject<[Action, Action]>(null);
  // public displayIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor() { }

  display(action: Action)
  {
    this.displayIn$.next(action);
  }

  output(oldAction: Action, action: Action)
  {
    this.oldToNewActions$.next([oldAction, action]);
  }



}
