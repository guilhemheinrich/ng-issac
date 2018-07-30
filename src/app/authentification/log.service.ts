import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggedUser } from './user';
import {Router} from '@angular/router';
import { NullAstVisitor } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  isLoggedIn: boolean = false;
  loggedUser: LoggedUser = null;
  // store the URL so we can redirect after logging in
  redirectUrl: string;
  public logUpdate$: BehaviorSubject<LoggedUser> = new BehaviorSubject<LoggedUser>(null);

  constructor(
    private router: Router
  ) { }

  login(user){
    localStorage.setItem('user', JSON.stringify(user));
    // this.loggedUser = user;
    // this.isLoggedIn = true;
    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
    }
    this.logUpdate$.next(user);
  }

  logout(){
    this.loggedUser = null;
    this.isLoggedIn = false;
    localStorage.removeItem('user');
    this.logUpdate$.next(this.loggedUser);
  }
}
