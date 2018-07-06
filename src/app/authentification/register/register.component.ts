import { Component, OnInit, Directive, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, Prefix, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { User } from '../user';
import {GlobalVariables, hash32} from '../../configuration';
import { Observable, Subscription } from 'rxjs';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user = new User();
  @ViewChild('emailChecker') emailInput: ElementRef;

  constructor(
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService
  ) {
    this.sparqlClient.sparqlEndpoint = 'http://localhost:8890/sparql';
  }

  ngOnInit() {
  }

  emailAlreadyInUse(): Observable<any> {
    this.sparqlParser.clear();
    this.sparqlParser.queryType = QueryType.ASK;
    this.sparqlParser.prefixes = [{prefix: "foaf",uri: "http://xmlns.com/foaf/0.1/" }];
    this.sparqlParser.graphDefinition = new GraphDefinition([`?uri foaf:mbox [ rdf:value \"${this.user.email}\"^^xsd:string ] .\n`]);
    let askQuery = this.sparqlParser.toString();
    console.log(askQuery);
    return this.sparqlClient.queryByGet(askQuery);
  }

  onSubmit() {
    let check$ = this.emailAlreadyInUse();
    check$.subscribe(
      response => {
        if (!response.boolean) {
          console.log('Handle form');
      this.sparqlParser.clear();
      this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_administration.uri;
      this.sparqlParser.queryType = QueryType.ADD;

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

      this.sparqlParser.graphDefinition = new GraphDefinition([
        `
        prefix_agent:${hashedEmail} a foaf:Agent .
        prefix_agent:${hashedEmail} admin:hasPassword \"${this.user.password}\"^^xsd:string .
        prefix_agent:${hashedEmail} foaf:mbox [ rdf:value \"${this.user.email}\"^^xsd:string ].
        prefix_agent:${hashedEmail} foaf:nick \"${this.user.username}\"^^xsd:string .
        `
      ]);

      let result = this.sparqlClient.updateByUrlEncodedPost(this.sparqlParser.toString());
      result.subscribe((response => console.log(response)));
      // console.log(this.sparqlParser.toString());
      console.log("Submitted !");
    } else {
      console.log(this.emailInput.nativeElement.hidden = false);
      console.log('Email Already In Use');
    }
        });

    
  }

}
