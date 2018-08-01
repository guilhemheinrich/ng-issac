import { GlobalVariables, hash32 } from '../configuration';
import { Observable } from 'rxjs';

export class User {
  username = "Bob";
  email = "bob@email.com";
  password = "";
  password_retype = "";
  uri = "";
  constructor() {
    this.uri = GlobalVariables.ONTOLOGY_PREFIX.prefix_agent.uri + hash32(this.email);
  }

  // constructor(
  //     public username: string,
  //     public email: string,
  //     public password?: string,
  //     public password_retype?: string
  // ){
  // }

}

export class LoggedUser {
  username = "";
  email = "";
  uri = "";
  constructor(options?: any) {
    if (options) {
      this.username  = options.username;
      this.email     = options.email   ;
      this.uri       = options.uri     ;
    }
  }
}

export const logged = new Observable();