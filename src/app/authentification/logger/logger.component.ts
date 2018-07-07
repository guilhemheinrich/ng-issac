import { Component, OnInit, Input } from '@angular/core';
import { LogService } from '../log.service';
import { User, LoggedUser } from '../user';

@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.css'],
  
})
export class LoggerComponent implements OnInit {

  logged = false;
  @Input()
  loggedUser: LoggedUser;
  constructor(
    private logService: LogService,
  ) { 

    this.logService.log$.subscribe(
      value => {
         console.log('log is ' + (value != null));
         this.loggedUser = value;
         this.logged = value != null;
      });
  }

  ngOnInit() {
    console.log(this.logService);
    console.log(this.logService.log$);

  }

  onLogout() {
    this.logged = false;
    // this.localStorageService.set('user', null);
    this.logService.logout();
    console.log(this.logged);
  }


}
