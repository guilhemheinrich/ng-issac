import { Component, OnInit, Input, Output, OnChanges, ViewChild, ElementRef} from '@angular/core';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32 } from '../../configuration';
import {ThesaurusEntry} from '../thesaurusEntry';
import { UniqueIdentifier } from '../../configuration';
// import { Output as pOutput } from '../../processus/processus';



@Component({
  selector: 'app-thesaurus-display',
  templateUrl: './thesaurus-display.component.html',
  styleUrls: ['./thesaurus-display.component.css']
})
export class ThesaurusDisplayComponent implements OnInit {

  searchField: string;

  @ViewChild('searchInput')
  searchInput: ElementRef;
  @Output()
  result: UniqueIdentifier;
  mapThesaurusEntries: {[uri:string] : ThesaurusEntry} = {};
  thesaurusEntries: ThesaurusEntry[] = <ThesaurusEntry[]>[] ;
  thesaurusEntry: ThesaurusEntry;

  graphDefinition: string = '';
  graphId: string = 'mermaidGraph';


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
    if (this.searchField && this.searchField.length >= 3) {
      this.typingTimer = window.setTimeout(() => { this.autocomplete() }, this.typingTimeout);
    }
  }


  autocomplete() {
    var result = this.search(this.searchField);
    result.subscribe((response => {
      if (response['results']['bindings']) {
        this._parseResults(response['results']['bindings']);
      }
    }));
  };

  onClickIdentifier(identifier: UniqueIdentifier)
  {
    var result = this.searchUri(identifier.uri);
    result.subscribe((response => {
      if (response['results']['bindings']) {
        this.computeGraphDefinition(identifier, response['results']['bindings']);
        // We need to delay for the mermaid component to render the svg graph
        window.setTimeout(() => this._postProcess(), 200);
      }
    }))
  }

  private _postProcess()
  {
    // Add click event
    if (this.thesaurusEntry.parent) {
      let node = document.getElementById('Parent');
      node.addEventListener("click", () =>this.onClickIdentifier(this.thesaurusEntry.parent));
    }
    this.thesaurusEntry.childs.forEach(((child, index) => 
    {
      let node = document.getElementById('C' + index);
      node.addEventListener("click", () =>this.onClickIdentifier(child));
    }));
    this.thesaurusEntry.siblings.forEach(((sibling, index) => 
    {
      let node = document.getElementById('S' + index);
      node.addEventListener("click", () => this.onClickIdentifier(sibling));
    }));
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
    this.sparqlParser.graphPattern = searchQueryLabel;
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
          }
        );
      }
    });
    // Filling
    bindings.map(entry => {
      if (entry.labelBroader &&
        !this.mapThesaurusEntries[entry.uri.value].parent) {
          this.mapThesaurusEntries[entry.uri.value].parent = <UniqueIdentifier>{ name: entry.labelBroader.value, uri: entry.uriBroader.value};
      }
    })
    this.thesaurusEntries = Object.values(this.mapThesaurusEntries);
  }

  computeGraphDefinition(identifier: UniqueIdentifier, bindings: Array<any>)
  {
    this.thesaurusEntry = new ThesaurusEntry({
      id: identifier
    })
    // Not really satisfying method ..
    var uriChilds = <string[]>[];
    var uriSiblings = <string[]>[];
    this.thesaurusEntry.childs =  <UniqueIdentifier[]>[];
    this.thesaurusEntry.siblings =  <UniqueIdentifier[]>[];
    // Filling
    bindings.map(entry => {
      if (entry.uriBroader) {
          this.thesaurusEntry.parent = <UniqueIdentifier>{ name: entry.labelBroader.value, uri: entry.uriBroader.value};
      }
      if (entry.uriNarrower && 
        !uriChilds.includes(entry.uriNarrower.value)) {
          this.thesaurusEntry.childs.push(<UniqueIdentifier>{ name: entry.labelNarrower.value, uri: entry.uriNarrower.value});
          uriChilds.push(entry.uriNarrower.value);
      }
      if (entry.labelSibling &&
        !uriSiblings.includes(entry.uriSibling.value) &&
        entry.uriSibling.value != identifier.uri) {
          this.thesaurusEntry.siblings.push(<UniqueIdentifier>{ name: entry.labelSibling.value, uri: entry.uriSibling.value});
          uriSiblings.push(entry.uriSibling.value);
      }
    })

    this.graphDefinition = `
      graph TB;\n
      classDef thesaurusMermaid:hover cursor:pointer, fill:aquamarine;
    `;
    if (this.thesaurusEntry.parent) {
      this.graphDefinition += `Parent("${this.thesaurusEntry.parent.name}")-->This("${this.thesaurusEntry.id.name}");\n`
      this.graphDefinition += `class Parent thesaurusMermaid;\n`
    }
    this.thesaurusEntry.childs.forEach(((child, index) => 
    {
      this.graphDefinition += `This-->C${index}("${child.name}");\n`;
      this.graphDefinition += `class C${index} thesaurusMermaid;\n`
    }));
    this.thesaurusEntry.siblings.forEach(((sibling, index) => 
      {
        this.graphDefinition += `Parent-->S${index}("${sibling.name}");\n`;
      this.graphDefinition += `class S${index} thesaurusMermaid;\n`
      }));
  }





}
