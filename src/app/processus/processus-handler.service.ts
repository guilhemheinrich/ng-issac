import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Processus, Action, ActionType} from './processus';


@Injectable({
  providedIn: 'root'
})
export class ProcessusHandlerService {

  currentProcessus$: BehaviorSubject<Processus> = new BehaviorSubject<Processus>(null);;

  constructor() { }


}
