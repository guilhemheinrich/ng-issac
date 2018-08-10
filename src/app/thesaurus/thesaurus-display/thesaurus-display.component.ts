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
        console.log(response['results']['bindings']);
      }
    }));

  }

  private _postProcess(eventContent: any) {
    // Add click event
    if (this.thesaurusEntry.parent) {
      let node = document.getElementById('Parent');
      node.addEventListener("click", () => this.onClickIdentifier(this.thesaurusEntry.parent));
    }
    this.thesaurusEntry.childs.forEach(((child, index) => {
      let node = document.getElementById('C' + index);
      node.addEventListener("click", () => this.onClickIdentifier(child));
    }));
    this.thesaurusEntry.siblings.forEach(((sibling, index) => {
      let node = document.getElementById('S' + index);
      node.addEventListener("click", () => this.onClickIdentifier(sibling));
    }));
  }

  // Query the search filed for identifiers
  search(input: string) {
    // this.sparqlParser.clear();
    // this.sparqlParser.queryType = QueryType.QUERY;
    // this.sparqlParser.prefixes = [
    //   GlobalVariables.ONTOLOGY_PREFIX.foaf,
    //   GlobalVariables.ONTOLOGY_PREFIX.issac,
    //   GlobalVariables.ONTOLOGY_PREFIX.skos,
    // ];
    // var searchQueryLabel = new GraphDefinition({triplesContent : [
    //   `
    //     ?uri skos:prefLabel ?label .
    //     FILTER regex(STR(?label), \"${input}\", \"i\") . 
    //     FILTER (lang(?label) = 'en') .
    //     OPTIONAL {
    //       ?uri skos:altLabel ?altLabel .
    //       FILTER regex(STR(?altLabel), \"${input}\", \"i\") . 
    //       FILTER (lang(?altLabel) = 'en') .
    //     }
    //     `
    // ]});
    // this.sparqlParser.graphPattern = searchQueryLabel;
    // let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    // console.log(this.sparqlParser.toString());


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
    // this.sparqlParser.clear();
    // this.sparqlParser.queryType = QueryType.QUERY;
    // this.sparqlParser.prefixes = [
    //   GlobalVariables.ONTOLOGY_PREFIX.foaf,
    //   GlobalVariables.ONTOLOGY_PREFIX.issac,
    //   GlobalVariables.ONTOLOGY_PREFIX.skos,
    // ];

    // /* For the parent */
    // var searchQueryLabel = new GraphDefinition({triplesContent : [
    //   `
    //     <${uri}> skos:prefLabel ?label .
    //     OPTIONAL {
    //       <${uri}> skos:broader ?uriBroader .
    //       ?uriBroader skos:prefLabel ?labelBroader
    //     }
    //     `
    // ]});

    // /* For the childs */
    // searchQueryLabel.triplesContent.push(
    //   `
    //   OPTIONAL {

    //     ?uriNarrower skos:prefLabel ?labelNarrower.
    //     FILTER (lang(?labelNarrower) = 'en') .
    //   }
    //     `
    // );

    // /* For the siblings */
    // searchQueryLabel.triplesContent.push(
    //   `
    //   OPTIONAL {
    //     <${uri}> skos:broader ?uriBroader .
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

    // this.sparqlParser.graphPattern = searchQueryLabel;

    this.sparqlParser.clear();
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = ThesaurusEntry.requiredPrefixes;

    this.thesaurusEntry = new ThesaurusEntry();
    this.sparqlParser.graphPattern = this.thesaurusEntry.parseSkeleton();
    this.sparqlParser.select[0] = this.thesaurusEntry.makeBindings();

    // this.sparqlParser.order = '?uriSibling';
    console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    return result;
  }

  // private _parseResults(bindings: Array<any>)
  // {
  //   // Initialisation
  //   this.mapThesaurusEntries = {};
  //   bindings.forEach(entry => {
  //     if (!this.mapThesaurusEntries[entry.uri.value]) {
  //     this.mapThesaurusEntries[entry.uri.value] = new ThesaurusEntry(
  //         {
  //           id: {name: entry.label.value, uri: entry.uri.value},
  //         }
  //       );
  //     }
  //   });
  //   // Filling
  //   bindings.map(entry => {
  //     if (entry.labelBroader &&
  //       !this.mapThesaurusEntries[entry.uri.value].parent) {
  //         this.mapThesaurusEntries[entry.uri.value].parent = <UniqueIdentifier>{ name: entry.labelBroader.value, uri: entry.uriBroader.value};
  //     }
  //   })
  //   this.thesaurusEntries = Object.values(this.mapThesaurusEntries);

  //   this.thesaurusEntries.forEach((thesaurusEntry) => {
  //     this.thesaurusEntriesChips.push(
  //       Object.create({
  //         thesaurusEntry: thesaurusEntry,
  //         selected: false
  //       })
  //     );
  //   })
  // }

  computeChipList() {
    this.currentIdentiferChip = Object.create({ id: this.thesaurusEntry.id, selected: true });
    this.thesaurusEntry.childs.forEach((child) => { });
  }

  // computeGraphDefinition(identifier: UniqueIdentifier, bindings: Array<any>)
  // {
  //   this.thesaurusEntry = new ThesaurusEntry({
  //     id: identifier
  //   })
  //   // Not really satisfying method ..
  //   var uriChilds = <string[]>[];
  //   var uriSiblings = <string[]>[];
  //   var synonyms = <string[]>[];
  //   this.thesaurusEntry.childs =  <UniqueIdentifier[]>[];
  //   this.thesaurusEntry.siblings =  <UniqueIdentifier[]>[];
  //   let currentSiblingIndex:number = undefined;
  //   // Filling
  //   bindings.map(entry => {
  //     if (entry.uriBroader) {
  //         this.thesaurusEntry.parent = <UniqueIdentifier>{ name: entry.labelBroader.value, uri: entry.uriBroader.value};
  //     }
  //     if (entry.uriNarrower && 
  //       !uriChilds.includes(entry.uriNarrower.value)) {
  //         this.thesaurusEntry.childs.push(<UniqueIdentifier>{ name: entry.labelNarrower.value, uri: entry.uriNarrower.value});
  //         uriChilds.push(entry.uriNarrower.value);
  //     }
  //     if (entry.labelSibling &&
  //       !uriSiblings.includes(entry.uriSibling.value)) {
  //         this.thesaurusEntry.siblings.push(<UniqueIdentifier>{ name: entry.labelSibling.value, uri: entry.uriSibling.value});
  //         uriSiblings.push(entry.uriSibling.value);
  //     }
  //     if (entry.synonym &&
  //       !synonyms.includes(entry.synonym.value)) {
  //         this.thesaurusEntry.synonyms.push(entry.synonym.value);
  //         synonyms.push(entry.synonym.value);
  //     }
  //   })

  //   console.log(identifier.name);
  //   this.graphDefinition = `
  //     graph TB;\n
  //     classDef thesaurusMermaid:hover cursor:pointer, fill:aquamarine;
  //   `;
  //   if (this.thesaurusEntry.parent) {
  //     this.graphDefinition += `Parent("${this.thesaurusEntry.parent.name}");\n`
  //     this.graphDefinition += `class Parent thesaurusMermaid;\n`
  //   }
  //   this.thesaurusEntry.siblings.forEach(((sibling, index) => 
  //   {
  //     // Store the index of the "root" element
  //     if (sibling.name == this.thesaurusEntry.id.name) {
  //       console.log(sibling.name);
  //       currentSiblingIndex = index;
  //     }
  //     this.graphDefinition += `Parent-->S${index}("${sibling.name}");\n`;
  //     this.graphDefinition += `class S${index} thesaurusMermaid;\n`
  //   }));
  //   this.thesaurusEntry.childs.forEach(((child, index) => 
  //   {
  //     this.graphDefinition += `S${currentSiblingIndex}-->C${index}("${child.name}");\n`;
  //     this.graphDefinition += `class C${index} thesaurusMermaid;\n`
  //   }));
  // }





}
