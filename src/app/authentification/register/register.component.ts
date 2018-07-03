import { Component, OnInit } from '@angular/core';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, Prefix, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { User } from '../user';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user = new User();

  constructor(
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService
  ) {
    this.sparqlClient.sparqlEndpoint = 'http://localhost:8890/sparql';
  }

  ngOnInit() {
  }

  emailAlreadyInUse(): boolean {
    this.sparqlParser.clear();
    this.sparqlParser.queryType = QueryType.ASK;
    this.sparqlParser.prefixes = [{prefix: "foaf",uri: "http://xmlns.com/foaf/0.1/" }];
    this.sparqlParser.graphDefinition = new GraphDefinition([`?uri foaf:mbox [ rdf:value \"${this.user.email}\"^^xsd:string ] .\n`]);
    let askQuery = this.sparqlParser.toString();
    console.log(askQuery);
    let emailAlreadyInUse = false;
    this.sparqlClient.queryByGet(askQuery)
      .subscribe(response => emailAlreadyInUse = response.boolean);
    console.log(emailAlreadyInUse);
    return emailAlreadyInUse;
  }

  onSubmit() {
    if (!this.emailAlreadyInUse()) {
      console.log('Handle form');
      this.sparqlParser.clear();
      this.sparqlParser.prefixes = [{prefix: "foaf",uri: "http://xmlns.com/foaf/0.1/" }];
      this.sparqlParser.graph = "http://users";
      this.sparqlParser.queryType = QueryType.ADD;
      this.sparqlParser.graphDefinition = new GraphDefinition([`<http://${this.user.username}> a foaf:Agent .`]);
      console.log(this.sparqlParser.toString());
    } else {
      console.log('Email Already In Use');
    }
    // this.sparqlClient.sparqlEndpoint = 'http://localhost:8890/sparql';
    // let update = `
    // PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    // WITH <http://users>
    // INSERT {
    //   <http://${this.user.username}> a foaf:Agent .
    // }`;
    // this.sparqlParser.parse(update);
    // let result = this.sparqlClient.updateByUrlEncodedPost(update);
    
    // var parsedQuery = this.parser.parse(
    //   update);
    
    // // console.log(result.subscribe(response => console.log(response)));
    // console.log(parsedQuery);
    console.log("Submitted !");
  }

}
