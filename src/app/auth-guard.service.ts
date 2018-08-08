import { Injectable }       from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                           from '@angular/router';
import { LogService }      from './authentification/log.service';
import {SessionStorageService} from 'ngx-webstorage';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: LogService,
     private router: Router,
     private sessionSt:SessionStorageService,) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    // let isLoggedIn = localStorage.getItem('user');
    let isLoggedIn = this.sessionSt.retrieve('user');
    if (isLoggedIn) { return true; }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;

    // Navigate to the login page with extras
    this.router.navigate(['/authentification/login']);
    return false;
  }
}