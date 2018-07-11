import { HostListener, Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Processus, Action, Input, Output } from '../processus';
import { SparqlClientService } from '../../sparql-client.service';
import { SparqlParserService, GraphDefinition, QueryType } from '../../sparql-parser.service';
import { GlobalVariables, hash32 } from '../../configuration';
import * as $ from 'jquery';
import { autocomplete } from 'node_modules/jquery-autocomplete/jquery.autocomplete.js';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],

})
export class EditComponent implements OnInit {

  action: Action = new Action();
  processus: Processus;
  @ViewChild('modal') modal: ElementRef;
  @ViewChild('inputAgentLabel') inputAgentLabel: ElementRef;
  private currentFocus: number;

  constructor(
    private sparqlClient: SparqlClientService,
    private sparqlParser: SparqlParserService,
  ) {
    this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
  }

  ngOnInit() {
    var closeAutoComplete = this.closeAllLists;
    document.addEventListener("click", function (e) {
      // console.log('here');
      // closeAutoComplete(e.target);

    });
  }

  @HostListener('document:click', ['$event'])
  closeModal(event?: Event) {
    console.log('here in close modal');
    if (event && event.target == this.modal.nativeElement) {
      this.modal.nativeElement.style.display = "none";
    }
    if (!event) {
      this.modal.nativeElement.style.display = "none";
    }
  }

  openModal(type: string) {
    if (type === "input") {
      this.action = new Input();
    } else if (type === "output") {
      this.action = new Output();
    }
    console.log(this.action.constructor.name);
    this.modal.nativeElement.style.display = "block";
    this.currentFocus = null;
  }

  search(input: string) {
    this.sparqlParser.clear();
    this.sparqlParser.queryType = QueryType.QUERY;
    this.sparqlParser.prefixes = [
      GlobalVariables.ONTOLOGY_PREFIX.foaf,
      GlobalVariables.ONTOLOGY_PREFIX.issac,
      GlobalVariables.ONTOLOGY_PREFIX.skos,
    ];
    this.sparqlParser.graphPattern = new GraphDefinition([
      `
      ?uri skos:prefLabel ?label .
      FILTER regex(STR(?label), \" . ${input} . \", \"i\") . 
      FILTER (lang(?label) = 'en') .
      `
    ]);

    console.log(this.sparqlParser.toString());
    let result = this.sparqlClient.queryByUrlEncodedPost(this.sparqlParser.toString());
    result.subscribe((response => 
      {
        console.log(response);
      }));
  }

  autocomplete() {
    console.log(this.action.agentLabel);
    var parentNode = this.inputAgentLabel.nativeElement;
    var arr = this.search(this.action.agentLabel);
    // var a, b, i, val = this.action.agentLabel;
    // /*close any already open lists of autocompleted values*/
    // this.closeAllLists();
    // if (!val) { return false; }
    // this.currentFocus = -1;
    // /*create a DIV element that will contain the items (values):*/
    // a = document.createElement("DIV");
    // a.setAttribute("id", "autocomplete-list");
    // a.setAttribute("class", "autocomplete-items");
    // /*append the DIV element as a child of the autocomplete container:*/
    // parentNode.appendChild(a);
    // /*for each item in the array...*/
    // for (i = 0; i < arr.length; i++) {
    //   /*check if the item starts with the same letters as the text field value:*/
    //   if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
    //     /*create a DIV element for each matching element:*/
    //     b = document.createElement("DIV");
    //     /*make the matching letters bold:*/
    //     b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
    //     b.innerHTML += arr[i].substr(val.length);
    //     /*insert a input field that will hold the current array item's value:*/
    //     b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
    //     /*execute a function when someone clicks on the item value (DIV element):*/
    //     b.addEventListener("click", function (e) {
    //       /*insert the value for the autocomplete text field:*/
    //       inp.value = this.getElementsByTagName("input")[0].value;
    //       /*close the list of autocompleted values,
    //       (or any other open lists of autocompleted values:*/
    //       this.closeAllLists();
    //     });
    //     a.appendChild(b);
    //   }
    // }
  };

  addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    this.removeActive(x);
    if (this.currentFocus >= x.length) this.currentFocus = 0;
    if (this.currentFocus < 0) this.currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[this.currentFocus].classList.add("autocomplete-active");
  }

  removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  // @HostListener('document:click', ['$event.target'])
  closeAllLists(elmnt?) {
    console.log('here in close all lists');

    if (elmnt) {

      // console.log(elmnt);
    }
    // /*close all autocomplete lists in the document,
    // except the one passed as an argument:*/
    // var x = document.getElementsByClassName("autocomplete-items");
    // for (var i = 0; i < x.length; i++) {
    //   if (elmnt != x[i] && elmnt != inp) {
    //     x[i].parentNode.removeChild(x[i]);
    //   }
    // }
  }

}
