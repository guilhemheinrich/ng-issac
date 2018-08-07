import { Component, OnInit, Input } from '@angular/core';
import { LogService } from '../log.service';
import { Agent } from '../user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.css'],
  
})
export class LoggerComponent implements OnInit {

  logged = false;
  @Input()
  loggedUser: Agent;
  constructor(
    private logService: LogService,
    private router: Router
  ) { 

    this.loggedUser = JSON.parse(localStorage.getItem('user'));

  }

  ngOnInit() {
    console.log('onInitLog'); 
    console.log(this.loggedUser);
    console.log(this.loggedUser != null);
    this.logService.logUpdate$.subscribe(
      value => {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        console.log(this.loggedUser);
        //  this.loggedUser = value;
        //  this.logged = value != null;
        if (this.loggedUser != null) {
          this.logged = true;
        }
      });
      console.log(this.logged);
  }

  onLogout() {
    this.logged = false;
    this.logService.logout();
    this.router.navigate(['/']);  
  }


}
