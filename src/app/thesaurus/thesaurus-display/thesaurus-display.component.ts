import { Component, OnInit, Input, OnChanges} from '@angular/core';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32 } from '../../configuration';
import {ThesaurusEntry, uniqueIdentifier} from '../thesaurusEntry';


@Component({
  selector: 'app-thesaurus-display',
  templateUrl: './thesaurus-display.component.html',
  styleUrls: ['./thesaurus-display.component.css']
})
export class ThesaurusDisplayComponent implements OnInit {

  @Input() searchField: string;
  // mapThesaurusEntries: {uri:string, thesaurusEntry: ThesaurusEntry} = <{uri:string, thesaurusEntry: ThesaurusEntry}>{};
  mapThesaurusEntries: {[uri:string] : ThesaurusEntry} = {};
  thesaurusEntries: ThesaurusEntry[] = <ThesaurusEntry[]>[] ;


  // For the autocomplete delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 1000;

  constructor(
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
  ) {
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.delayedAutocomplete();
  }


  delayedAutocomplete() {
    if (this.typingTimer < this.typingTimeout) {
      window.clearTimeout(this.typingTimer);
    }
    this.typingTimer = window.setTimeout(() => { this.autocomplete() }, this.typingTimeout);
  }


  autocomplete() {
    var result = this.search(this.searchField);
    result.subscribe((response => {
      if (response['results']['bindings']) {
        this._parseResults(response['results']['bindings']);
      }
    }));
  };

  onClickUri(uri: string)
  {
    var result = this.searchUri(uri);
    result.subscribe((response => {
      if (response['results']['bindings']) {
        console.log(response['results']['bindings']);
      }
    }))
  }


  search(input: string) {
    this.sparqlParser.clear();
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = [
      GlobalVariables.ONTOLOGY_PREFIX.foaf,
      GlobalVariables.ONTOLOGY_PREFIX.issac,
      GlobalVariables.ONTOLOGY_PREFIX.skos,
    ];
    var searchQueryLabel = new GraphDefinition([
      `
        ?uri skos:prefLabel|skos:altLabel ?label .
        FILTER regex(STR(?label), \"${input}\", \"i\") . 
        FILTER (lang(?label) = 'en') .
        OPTIONAL {
          ?uri skos:broader ?uriBroader .
          ?uriBroader skos:prefLabel ?labelBroader
        }
        `
    ]);
    // Too heavy for general search !

    // searchQueryLabel.triplesContent.push(
    //   `
    //   OPTIONAL {
    //     ?uri skos:narrower ?uriNarrower .
    //     ?uriNarrower skos:prefLabel ?labelNarrower.
    //     FILTER (lang(?labelNarrower) = 'en') .
    //   }
    //     `
    // );
    // searchQueryLabel.triplesContent.push(
    //   `
    //   OPTIONAL {
    //     ?uri skos:broader ?uriBroader .
    //     ?uriBroader skos:prefLabel ?labelBroader.
    //     FILTER (lang(?labelBroader) = 'en') .
    //     OPTIONAL {
    //       ?uriBroader skos:narrower ?uriSibling .
    //       ?uriSibling skos:prefLabel ?labelSibling.
    //       FILTER (lang(?labelSibling) = 'en') .
    //     }
    //   }
    //     `
    // );

    this.sparqlParser.graphPattern = searchQueryLabel;
// console.log (this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    return result;

  }

  searchUri(uri: string)
  {
    this.sparqlParser.clear();
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = [
      GlobalVariables.ONTOLOGY_PREFIX.foaf,
      GlobalVariables.ONTOLOGY_PREFIX.issac,
      GlobalVariables.ONTOLOGY_PREFIX.skos,
    ];
    var searchQueryLabel = new GraphDefinition([
      `
        <${uri}> skos:prefLabel|skos:altLabel ?label .
        OPTIONAL {
          <${uri}> skos:broader ?uriBroader .
          ?uriBroader skos:prefLabel ?labelBroader
        }
        `
    ]);
    searchQueryLabel.triplesContent.push(
      `
      OPTIONAL {
        <${uri}> skos:narrower ?uriNarrower .
        ?uriNarrower skos:prefLabel ?labelNarrower.
        FILTER (lang(?labelNarrower) = 'en') .
      }
        `
    );
    searchQueryLabel.triplesContent.push(
      `
      OPTIONAL {
        <${uri}> skos:broader ?uriBroader .
        ?uriBroader skos:prefLabel ?labelBroader.
        FILTER (lang(?labelBroader) = 'en') .
        OPTIONAL {
          ?uriBroader skos:narrower ?uriSibling .
          ?uriSibling skos:prefLabel ?labelSibling.
          FILTER (lang(?labelSibling) = 'en') .
        }
      }
        `
    );

    this.sparqlParser.graphPattern = searchQueryLabel;
console.log (this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    return result;
  }

  private _parseResults(bindings: Array<any>)
  {
    // Initialisation
    this.mapThesaurusEntries = {};
    bindings.forEach(entry => {
      if (!this.mapThesaurusEntries[entry.uri.value]) {
      this.mapThesaurusEntries[entry.uri.value] = new ThesaurusEntry(
          {
            id: {name: entry.label.value, uri: entry.uri.value},
            // childs         : <uniqueIdentifier[]>[],
            // siblings       : <uniqueIdentifier[]>[],
          }
        );
      }
    });
    // Filling
    bindings.map(entry => {

      // if (entry.labelNarrower && 
      //   !this.mapThesaurusEntries[entry.uri.value].childs.includes(<uniqueIdentifier>{ name: entry.labelNarrower.value, uri: entry.uriNarrower.value})) {
      //     this.mapThesaurusEntries[entry.uri.value].childs.push(<uniqueIdentifier>{ name: entry.labelNarrower.value, uri: entry.uriNarrower.value});
      // }
      // if (entry.labelSibling &&
      //   !this.mapThesaurusEntries[entry.uri.value].siblings.includes(<uniqueIdentifier>{ name: entry.labelSibling.value, uri: entry.uriSibling.value})) {
      //     this.mapThesaurusEntries[entry.uri.value].siblings.push(<uniqueIdentifier>{ name: entry.labelSibling.value, uri: entry.uriSibling.value});
      // }
      if (entry.labelBroader &&
        !this.mapThesaurusEntries[entry.uri.value].parent) {
          this.mapThesaurusEntries[entry.uri.value].parent = <uniqueIdentifier>{ name: entry.labelBroader.value, uri: entry.uriBroader.value};
      }
    })

    this.thesaurusEntries = Object.values(this.mapThesaurusEntries);
  }

  



}
