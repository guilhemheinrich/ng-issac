import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as Annotation from '../annotation';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32, UniqueIdentifier, dateToxsdTimestamp } from '../../configuration';
import { LogService } from '../../authentification/log.service';

@Component({
  selector: 'app-message-displayer',
  templateUrl: './displayer.component.html',
  styleUrls: ['./displayer.component.css']
})
export class DisplayerComponent implements OnInit {

  @Input()
  target_uri: string

  text: string;


  annotations: Annotation.SparqlAnnotation[];

  constructor(
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
    private logService: LogService,
  ) {
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
  }

  ngOnInit() {
    this.loadMessages();
  }

  publish() {
    if (this.text !== '') {

      this.insertMessage();
      this.text = '';
    }
  }

  insertMessage() {
//     console.log(this.logService.loggedUser);
    let annotation = new Annotation.SparqlAnnotation(
      {
        target: this.target_uri,
        motivation: "oa:commenting",
        bodyValue: this.text,
        creator: this.logService.loggedUser(),
        created: dateToxsdTimestamp(new Date)
      }
    );
    this.sparqlParser.clear();

    this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_message.uri;
    this.sparqlParser.queryType = QueryType.ADD;
    this.sparqlParser.prefixes = Annotation.SparqlAnnotation.requiredPrefixes;

    var saveQuery = annotation.parseIdentity();
    this.sparqlParser.graphDefinition = saveQuery;
//     console.log(this.sparqlParser.toString());

    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response) => {
      this.ngOnChanges();
    });
  }


  ngOnChanges() 
  {
    this.loadMessages();
  }

  loadMessages() {
    let annotation = new Annotation.SparqlAnnotation();
    this.sparqlParser.clear();

    // this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = Annotation.SparqlAnnotation.requiredPrefixes;

    var query = annotation.parseSkeleton();

    this.sparqlParser.graphPattern = query;

    this.sparqlParser.select[0] = ' DISTINCT ' + annotation.makeBindings();
    if (this.target_uri) {
      let restriction = annotation.parseRestricter("target", [this.target_uri]);
      this.sparqlParser.graphPattern.merge(restriction);
    }
    this.sparqlParser.order = annotation.sparqlIdentifier('created');
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response) => {
      this.annotations = [];
      let annotationsResult = response.results.bindings;
      let i = 0;
//       console.log(annotationsResult.length);
      annotationsResult.forEach((annotation) => {
//         console.log(i++);
//         console.log(annotation);
        function jsonEscape(str)  {
          return str.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
      }
        this.annotations.push(new Annotation.SparqlAnnotation(JSON.parse(jsonEscape(annotation.SparqlAnnotation.value))));
      });
//       console.log(annotationsResult);
    });
  }
}
