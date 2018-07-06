import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from 'angular-2-local-storage';


@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.css'],
  
})
export class LoggerComponent implements OnInit {

  logged = false;
  loggedSubject: Observable<boolean>;
  constructor(
    private localStorageService: LocalStorageService
  ) { 
    // this.loggedSubject = new Observable((
    //   {
    //     next : x => return this.localStorageService.get('user') == null,
    //     error: err => console.error('Observer got an error: ' + err),
    //     complete: () => console.log('Observer got a complete notification'),
    //   }
    // ));

  }

  ngOnInit() {
    this.logged = this.localStorageService.get('user') == null;
  }

  onLogout() {
    this.logged = false;
    this.localStorageService.set('user', null);
    console.log(this.logged);
  }



  test() {
    console.log("inside test");
    // Create simple observable that emits three values
    let myObservable = of(1, 2, 3);
    
    // Create observer object
    let myObserver = {
      next: x => console.log('Observer got a next value: ' + x),
      error: err => console.error('Observer got an error: ' + err),
      complete: () => console.log('Observer got a complete notification'),
    };
    
    myObservable.subscribe(myObserver);

  }
}
