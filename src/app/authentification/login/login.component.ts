import { Component, OnInit } from '@angular/core';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import {GlobalVariables, hash32} from '../../configuration';
import { LogService } from '../log.service';
import { Router } from '@angular/router';

import { User, Agent } from '../user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user = new User();
  loggedUser = new Agent;
  
  constructor(    
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
    private logService: LogService,
    private router: Router,
  ) { 
    // this.logService.logUpdate$.subscribe(
    //   value => {
    //      console.log('log is ' + value);
    //      console.log('log is ' + (value != null));
    //   }
//  );
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
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

    this.sparqlParser.graphPattern = new GraphDefinition({triplesContent : [
      `
      prefix_agent:${hashedEmail} a foaf:Agent .
      prefix_agent:${hashedEmail} admin:hasPassword \"${this.user.password}\"^^xsd:string .
      prefix_agent:${hashedEmail} foaf:mbox [ rdf:value \"${this.user.email}\"^^xsd:string ].
      prefix_agent:${hashedEmail} foaf:nick ?nickname .
      `
    ]});
//     console.log(this.sparqlParser.toString());

    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => 
      {
//         console.log(response);
        if (response.results.bindings.length !== 1) {
        } else {
          this.loggedUser.username = response.results.bindings[0].nickname.value;
          this.loggedUser.email = this.user.email;
          this.loggedUser.uri = GlobalVariables.ONTOLOGY_PREFIX.prefix_agent.uri + hashedEmail;
          this.logService.login(this.loggedUser);
          this.router.navigate(['/processus/index']);
        }
      }));
  }

}
