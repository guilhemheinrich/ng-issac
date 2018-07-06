import { Component, OnInit } from '@angular/core';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, Prefix, GraphDefinition, QueryType } from '../../sparql-parser.service';
import {GlobalVariables, hash32} from '../../configuration';
import { LocalStorageService } from 'angular-2-local-storage';

import { User, LoggedUser } from '../user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user = new User();
  loggedUser = new LoggedUser;
  
  constructor(    
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
    private localStorageService: LocalStorageService
  ) {
    this.sparqlClient.sparqlEndpoint = 'http://localhost:8890/sparql';
   }

  ngOnInit() {
  }

  onSubmit() {
    this.sparqlParser.clear();
    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_administration.uri;
    this.sparqlParser.queryType = QueryType.QUERY;

    // All prefixes
    // this.sparqlParser.prefixes = <Prefix[]>(Object.entries(GlobalVariables.ONTOLOGY_PREFIX).map(
    //   (value) => {return value[1]})); 
    this.sparqlParser.prefixes = [
      GlobalVariables.ONTOLOGY_PREFIX.admin,
      GlobalVariables.ONTOLOGY_PREFIX.issac,
      GlobalVariables.ONTOLOGY_PREFIX.foaf,
      GlobalVariables.ONTOLOGY_PREFIX.context_administration,
      GlobalVariables.ONTOLOGY_PREFIX.prefix_agent,
    ]

    let hashedEmail = hash32(this.user.email);

    this.sparqlParser.graphPattern = new GraphDefinition([
      `
      prefix_agent:${hashedEmail} a foaf:Agent .
      prefix_agent:${hashedEmail} admin:hasPassword \"${this.user.password}\"^^xsd:string .
      prefix_agent:${hashedEmail} foaf:mbox [ rdf:value \"${this.user.email}\"^^xsd:string ].
      prefix_agent:${hashedEmail} foaf:nick ?nickname .
      `
    ]);

    console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => 
      {
        if (response.results.bindings.length !== 1) {
          console.log('i dont');
        } else {
          this.loggedUser.username = response.results.bindings[0].nickname.value;
          this.loggedUser.email = this.user.email;
          this.loggedUser.uri = GlobalVariables.ONTOLOGY_PREFIX.prefix_agent.uri + hashedEmail;
          this.localStorageService.set('user', this.loggedUser);
          console.log('i do');
          console.log(this.loggedUser);
        }
        console.log(response);
      }));
  }

}
