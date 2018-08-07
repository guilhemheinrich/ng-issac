import { GlobalVariables, hash32 } from '../configuration';
import { Observable } from 'rxjs';
import { SparqlClass, Uri, Litteral, Prefix, GraphDefinition, SparqlId } from '../sparql-parser.service';
import { UpperCasePipe } from '@angular/common';

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

export class Agent extends SparqlClass {
  @Litteral()
  username = "";
  @Litteral()
  email = "";

  @SparqlId
  @Uri()
  uri = "";

  static readonly requiredPrefixes: Prefix[] = [
    GlobalVariables.ONTOLOGY_PREFIX.admin,
    GlobalVariables.ONTOLOGY_PREFIX.foaf,
    GlobalVariables.ONTOLOGY_PREFIX.context_administration,
    GlobalVariables.ONTOLOGY_PREFIX.prefix_agent,
  ]

  constructor(options?: any) {
    super();
    if (options) {
      this.username = options.username;
      this.email = options.email;
      this.uri = options.uri;
    }
  }

  parseSkeleton(prefix: string = ''): GraphDefinition {
    var query = new GraphDefinition({
      triplesContent: [
        `
          ${this.sparqlIdentifier('uri', prefix)} a foaf:Agent .
          ${this.sparqlIdentifier('uri', prefix)} foaf:mbox [ rdf:value ${this.sparqlIdentifier('email', prefix)} ].
          ${this.sparqlIdentifier('uri', prefix)} foaf:nick ${this.sparqlIdentifier('username', prefix)} .   
        `
      ]
    });


    return query;
  }

  toString() {
    return this.username;
  }

  parseFilter(prefix?: string):GraphDefinition {
    let filter = new GraphDefinition();
    ['username', 'email'].forEach((attribute) => {
      if (this[attribute] !== undefined && this[attribute] !== '')
          filter.triplesContent.push(`
      FILTER regex(STR(${this.sparqlIdentifier(attribute, prefix)}), '${this[attribute]}', 'i')
      `);
  });
    return filter;
  }
}

export const logged = new Observable();