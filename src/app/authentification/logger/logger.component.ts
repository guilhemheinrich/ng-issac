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
         this.loggedUser = value;
         this.logged = value != null;
      });
  }

  ngOnInit() {


  }

  onLogout() {
    this.logged = false;
    this.logService.logout();
  }


}
