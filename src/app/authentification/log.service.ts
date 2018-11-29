import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Agent } from './user';
import {Router} from '@angular/router';
import {SessionStorageService} from 'ngx-webstorage';
@Injectable({
  providedIn: 'root'
})
export class LogService {
  isLoggedIn: boolean = false;

  // store the URL so we can redirect after logging in
  redirectUrl: string;
  public logUpdate$: BehaviorSubject<Agent> = new BehaviorSubject<Agent>(null);

  constructor(
    private router: Router,
    private sessionSt:SessionStorageService
  ) { }

  login(user){
    this.sessionSt.store('user', JSON.stringify(user));
    if (this.redirectUrl) {
      console.log('i am redirected to ')
      console.log(this.redirectUrl)
      this.router.navigateByUrl(this.redirectUrl);
    } else {
      // this.router.navigate([this.redirectUrl]);
    }
    this.logUpdate$.next(user);
  }
  
  loggedUser(): Agent
  {
    return JSON.parse(this.sessionSt.retrieve('user'));
  }

  logout(){

    this.isLoggedIn = false;
    this.sessionSt.clear('user');
    this.logUpdate$.next(this.loggedUser());
  }
}
