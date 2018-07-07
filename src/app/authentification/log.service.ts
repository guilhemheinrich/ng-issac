import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggedUser } from './user';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  logged: boolean;
  loggedUser: LoggedUser = null;
  public log$: BehaviorSubject<LoggedUser> = new BehaviorSubject<LoggedUser>(null);

  constructor() { }

  login(user){
    this.loggedUser = user;
    this.logged = true;
    this.log$.next(this.loggedUser);
  }

  logout(){
    this.loggedUser = null;
    this.logged = false;
    this.log$.next(this.loggedUser);
  }
}
