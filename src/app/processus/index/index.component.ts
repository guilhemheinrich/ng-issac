import { Component, OnInit } from '@angular/core';
import {Processus, ProcessusBis, testP, InputBis} from '../processus';
import { SparqlParserService, GraphDefinition, SparqlBinding, Uri } from '../../sparql-parser.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  processusList: Processus[];

  public myuri: SparqlBinding;
  private _myuri

  constructor() {
    // this.myuri.value = 'http://hello';
  }

  ngOnInit() {
    this.searchAllProcessus();
  }

  searchAllProcessus ()
  {
    let processus = new ProcessusBis();
    let test = new testP();
    // console.log(processus._uris);
    // processus.description.value = 'A description';
    processus.uri = 'http://uri';
    processus.inputs.push(new InputBis());
    // processus.turi = 'anotherUri';
    console.log(processus); 
    console.log(test); 
    console.log(processus.parseSkeletonQuery());
  }
}
