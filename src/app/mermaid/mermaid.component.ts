import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import * as mermaid from 'mermaid';
import * as $ from 'jquery';

@Component({
  selector: 'app-mermaid',
  templateUrl: './mermaid.component.html',
  styleUrls: ['./mermaid.component.css']
})
export class MermaidComponent implements OnInit {
  @Input()
  graphDefinition: string;

  @ViewChild("mermaid") 
  mermaidContainer: ElementRef;
  constructor() { }

  ngOnInit() {
    this.renderMermaid();
  }

  ngOnChanges() {
    
    this.renderMermaid();
  }

  renderMermaid()
  {
    console.log('i changed !');
    this.graphDefinition = `
      graph TB;\n
      A-->B;
    `;
    this.mermaidContainer.nativeElement.innerHTML = this.graphDefinition;
    var cb = svgGraph => {
      this.mermaidContainer.nativeElement.innerHTML = svgGraph
    }
    mermaid.mermaidAPI.render('id1',this.graphDefinition, cb)
  }

}
