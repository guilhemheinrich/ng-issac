import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {IssacContext} from 'src/app/issac-definitions/context';
@Injectable({
  providedIn: 'root'
})
export class ContextDisplayerService {

  public displayIn$: BehaviorSubject<{'context' : IssacContext, 'editable' : boolean}> = new BehaviorSubject(null);
  public oldToNewContext$: BehaviorSubject<[IssacContext, IssacContext]> = new BehaviorSubject<[IssacContext, IssacContext]>(null);

  constructor() { }

  display(context: IssacContext, editable = false)
  {
    console.log('displaying context toggling');

    this.displayIn$.next({'context' : context, 'editable' : editable});
  }

  output(oldContext: IssacContext, context: IssacContext)
  {
//     console.log('in output');
    this.oldToNewContext$.next([oldContext, context]);
  }
}
