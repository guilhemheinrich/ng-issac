import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32 } from '../../configuration';
import { ThesaurusEntry, SkosIdentifier } from '../thesaurusEntry';
import { UniqueIdentifier } from '../../configuration';
import { MermaidComponent } from '../../mermaid/mermaid.component';
import { MatChipList } from '@angular/material';
// import { Input } from '../../processus/processus';
// import { Output as pOutput } from '../../processus/processus';



@Component({
  selector: 'app-thesaurus-display',
  templateUrl: './thesaurus-display.component.html',
  styleUrls: ['./thesaurus-display.component.css']
})
export class ThesaurusDisplayComponent implements OnInit {

  searchField: string;



  // @Input()
  // currentIdentifier: UniqueIdentifier;
  @ViewChild('mermaidGraph')
  meramidComponent: MermaidComponent
  @ViewChild('searchInput')
  searchInput: ElementRef;
  @Output()
  result = new EventEmitter<UniqueIdentifier>();
  selectedIndex: number;


  mapThesaurusEntries: { [uri: string]: ThesaurusEntry } = {};
  thesaurusEntries: ThesaurusEntry[] = <ThesaurusEntry[]>[];
  thesaurusEntry: ThesaurusEntry;
  thesaurusEntriesChips: Array<{
    thesaurusEntry: ThesaurusEntry,
    selected: boolean
  }> = [];
  searchResultChips: Array<UniqueIdentifier> = [];
  lastSelectedChip: {
    thesaurusEntry: ThesaurusEntry,
    selected: boolean
  } = Object.create({
    selected: false
  });
  currentIdentiferChip: {
    id: UniqueIdentifier,
    selected: boolean,
  }
  siblingsIdentifiersChips: Array<{
    thesaurusEntry: UniqueIdentifier,
    selected: boolean
  }> = [];
  childsIdentifiersChips: Array<{
    thesaurusEntry: UniqueIdentifier,
    selected: boolean
  }> = [];

  graphDefinition: string = ``;
  graphId: string = 'mermaidGraph';

  @Input('height')
  height: string = "500px";

  // For the autocomplete delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 500;

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
        // this._parseResults(response['results']['bindings']);
        this._parseSearch(response['results']['bindings']);
      }
    }));
  };

  onMatSelected($event: any) {
    console.log($event);
    if ($event.selected == true) {

    }
  }

  onMatClicked(id) {
    this.onClickIdentifier(id);
    // tec.selected = !tec.selected;
    // if (tec.selected == true) 
    // {
    // }
    // if (this.lastSelectedChip != tec && this.lastSelectedChip.selected == true)
    // {
    //   this.lastSelectedChip.selected = false;
    // }
    // this.lastSelectedChip = tec;
    // console.log(this.selectedIndex);
    // console.log(this.chipList.chips);
    // console.log(this.chipList.chips[index]);
    // this.chipList.chips[index].selected = true; 
  }

  onClickIdentifier(identifier: UniqueIdentifier) {
    // if (!identifier.uri) return;
    this.result.emit(identifier);
    var result = this.searchUri(identifier.uri);
    result.subscribe((response => {
      if (response['results']['bindings']) {
        // this.computeGraphDefinition(identifier, response['results']['bindings']);
        console.log(response['results']['bindings'][0].ThesaurusEntry.value);
        let toObjectify = <string>response['results']['bindings'][0].ThesaurusEntry.value;  
        // toObjectify = toObjectify.replace(/\"\"/g,"null");
        console.log(toObjectify);
        this.thesaurusEntry = new ThesaurusEntry(JSON.parse(toObjectify));
        console.log(this.thesaurusEntry);
        
      }
    }));

  }

  // private _postProcess(eventContent: any) {
  //   // Add click event
  //   if (this.thesaurusEntry.parent) {
  //     let node = document.getElementById('Parent');
  //     node.addEventListener("click", () => this.onClickIdentifier(this.thesaurusEntry.parent));
  //   }
  //   this.thesaurusEntry.childs.forEach(((child, index) => {
  //     let node = document.getElementById('C' + index);
  //     node.addEventListener("click", () => this.onClickIdentifier(child));
  //   }));
  //   this.thesaurusEntry.siblings.forEach(((sibling, index) => {
  //     let node = document.getElementById('S' + index);
  //     node.addEventListener("click", () => this.onClickIdentifier(sibling));
  //   }));
  // }

  // Query the search filled for identifiers
  search(input: string) {
   

    this.sparqlParser.clear();
    // this.sparqlParser.graph = GlobalVariables.ONTOLOGY_PREFIX.context_processus_added.uri;
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = SkosIdentifier.requiredPrefixes;
    let emptySkosIdentifier = new SkosIdentifier();
    var query = emptySkosIdentifier.parseSkeleton();
    var gather = emptySkosIdentifier.parseGather(input, query);
    this.sparqlParser.graphPattern = gather;
    this.sparqlParser.select[0] = emptySkosIdentifier.makeBindings();
    console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    return result;
  }

  _parseSearch(bindings: Array<any>) {
    let allSkosIdentifier = bindings;
    this.searchResultChips = [];
    allSkosIdentifier.forEach((skosIdentifierJSON) => {
      let parsed_identifier = JSON.parse(skosIdentifierJSON.SkosIdentifier.value);
      let uniqueIdentifier = new UniqueIdentifier();
      uniqueIdentifier.uri = parsed_identifier.uri;
      uniqueIdentifier.name = parsed_identifier.name;
      this.searchResultChips.push(uniqueIdentifier);
    })
    console.log(this.searchResultChips);
  }

  searchUri(uri: string) {
    
    this.sparqlParser.clear();
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = ThesaurusEntry.requiredPrefixes;

    let thesaurusEntryQuerrier = new ThesaurusEntry();
    this.sparqlParser.graphPattern = thesaurusEntryQuerrier.parseSkeleton();
    this.sparqlParser.select[0] = thesaurusEntryQuerrier.makeBindings();
    this.sparqlParser.graphPattern.merge(thesaurusEntryQuerrier.id.parseRestricter("uri", [uri], thesaurusEntryQuerrier.sparqlIdentifier("id")));
    // this.sparqlParser.order = '?uriSibling';
    console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    return result;
  }

 

  computeChipList() {
    this.currentIdentiferChip = Object.create({ id: this.thesaurusEntry.id, selected: true });
    this.thesaurusEntry.childs.forEach((child) => { });
  }




}
