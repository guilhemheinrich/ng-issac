import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggedUser } from './user';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  isLoggedIn: boolean = false;
  loggedUser: LoggedUser = null;
  // store the URL so we can redirect after logging in
  redirectUrl: string;
  public log$: BehaviorSubject<LoggedUser> = new BehaviorSubject<LoggedUser>(null);

  constructor(
    private router: Router
  ) { }

  login(user){
    this.loggedUser = user;
    this.isLoggedIn = true;
    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
    }
    this.log$.next(this.loggedUser);
  }

  logout(){
    this.loggedUser = null;
    this.isLoggedIn = false;
    this.log$.next(this.loggedUser);
  }
}
