// import { Component, OnInit, Input} from '@angular/core';
// import * as Annotation from '../annotation';
// import { SparqlClientService } from '../../sparql-client.service';
// import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
// import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';

// @Component({
//   selector: 'app-displayer',
//   templateUrl: './displayer.component.html',
//   styleUrls: ['./displayer.component.css']
// })
// export class DisplayerComponent implements OnInit {

//   @Input()
//   uri: string

//   annotation: Annotation.SparqlAnnotation;

//   constructor(
//     private sparqlClient: SparqlClientService,
//     private sparqlParser: SparqlParserService,
//   ) { 
//     this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
//   }

//   ngOnInit() {
//   }


//   ngOnChanges() {
//     this.annotation = new Annotation.SparqlAnnotation();
//     this.sparqlParser.clear();

//     // this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
//     this.sparqlParser.queryType = QueryType.QUERY;
//     this.sparqlParser.prefixes = Annotation.SparqlAnnotation.requiredPrefixes;

//     // var query = this.processus.parseSkeleton();
    
//     // // this.sparqlParser.order = '?uriSibling';
//     // this.sparqlParser.graphPattern = query;
//     // this.sparqlParser.graphPattern.merge(this.processus.parseRestricter('uri', [this.id]));
//     // this.sparqlParser.select[0] = ' DISTINCT ' + this.processus.makeBindings();
//     // let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
//     // result.subscribe((response => {
      
//     //   this.processus = new Processus(JSON.parse(response.results.bindings[0].Processus.value));
//     //   this.processus.actions.forEach((action) => {
//     //     switch (action.type)
//     //     {
//     //       case ActionType.INPUT:
//     //       this.processus.inputs.push(new pInput({agentUri: action.agentUri, agentLabel: action.agentLabel}));
//     //       break;
//     //       case ActionType.OUTPUT:
//     //       this.processus.outputs.push(new pOutput({agentUri: action.agentUri, agentLabel: action.agentLabel}));
//     //       break;
//     //     }
//     //   });
      
//     // }))
//   }
// }
