import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {IssacProcessus} from 'src/app/issac-definitions/processus';

@Injectable({
  providedIn: 'root'
})
export class ProcessusService {

  public displayIn$: BehaviorSubject<{'processus' : IssacProcessus, 'editable' : boolean}> = new BehaviorSubject(null);
  public newProcessus$: BehaviorSubject<IssacProcessus> = new BehaviorSubject<IssacProcessus>(null);

  constructor() { }

  display(processus: IssacProcessus, editable = false)
  {
    this.displayIn$.next({'processus' : processus, 'editable' : editable});
  }

  output(processus: IssacProcessus)
  {
//     console.log('in output');
    this.newProcessus$.next(processus);
  }


}
