import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, OnChanges, Output, Injectable } from '@angular/core';
import * as mermaid from 'mermaid';
import * as $ from 'jquery';
import { pipeBind1 } from '@angular/core/src/render3/pipe';

@Component({
  selector: 'app-mermaid',
  templateUrl: './mermaid.component.html',
  styleUrls: ['./mermaid.component.css'],
})
export class MermaidComponent implements OnInit {
  @Input()
  graphDefinition: string = ``;

  @Input()
  graphId: string="mermaidGraph";
  @Input()
  mermaidId: string="mermaidId";
  @Input()
  viewPortHeight: string = "";
  @Input()
  viewPortWidth: string = "";
  @Input()
  preserveAspectRatio: string = "";

  @Output()
  finishDrawing = new EventEmitter<any>();

  @ViewChild("mermaid") 
  mermaidContainer: ElementRef;

  constructor() { 
  }



  ngOnInit() {
    this.mermaidContainer.nativeElement.innerHTML = this.graphDefinition;
  }

  ngOnChanges() {
    console.log('onChange mermaid');

    this.renderMermaid();

    // Fix : for unknown reason, the first time a graph should be rendered in thesaurus
    // it just show the unparsed definition graph.
    // Wainting 'a bit' fix it, but a proper fix/understandment would be better 
    let typingTimeout: number = 100;
    window.setTimeout(() => { this.renderMermaid() }, typingTimeout);

  }

  renderMermaid()
  {
    // Skip if there is no graph
    if (!this.graphDefinition) return;
    this.mermaidContainer.nativeElement.innerHTML = this.graphDefinition;
    var cb = svgGraph => {
      let svgTagIndex = svgGraph.match(/<svg[^>]*>/)['index'];

      // See https://jsperf.com/javascript-string-splice-reloaded
      // svgTagIndex + 4 is right after "<svg"
      svgGraph = svgGraph.slice(0, svgTagIndex + 4) + ` preserveAspectRatio="${this.preserveAspectRatio}"` + svgGraph.slice(svgTagIndex + 4);

      let regexViewPortHeight = /(<svg[^>]*)(?=height)(height=)("[^"]*")([^>]*>)/;
      if (svgGraph.match(regexViewPortHeight)) {
        svgGraph = svgGraph.replace(regexViewPortHeight, (match, p1, p2, p3, p4, offset, string) => {
          if (this.viewPortHeight === "") {
            return p1 + p4;
          }
          return p1 + p2 + "\"" + this.viewPortHeight + "\"" + p4;
        });
      } else if (this.viewPortHeight !== "") {
        svgGraph = svgGraph.slice(0, svgTagIndex + 4) + ` height="${this.viewPortHeight}"` + svgGraph.slice(svgTagIndex + 4);
      }


      let regexViewPortWidth = /(<svg[^>]*)(?=width)(width=)("[^"]*")([^>]*>)/;
      if (svgGraph.match(regexViewPortWidth)) {
        svgGraph = svgGraph.replace(regexViewPortWidth, (match, p1, p2, p3, p4, offset, string) => {
          if (this.viewPortWidth === "") {
            return p1 + p4;
          }
          return p1 + p2 + "\"" + this.viewPortWidth + "\"" + p4;
        });
      } else if (this.viewPortWidth !== "") {
        svgGraph = svgGraph.slice(0, svgTagIndex + 4) + ` width="${this.viewPortWidth}"` + svgGraph.slice(svgTagIndex + 4);
      }
      this.mermaidContainer.nativeElement.innerHTML = svgGraph;
  // console.log('in mermaid render');
  //     console.log(svgGraph)
      this.finishDrawing.emit(this.mermaidContainer);
      // this.post_process_callback();
      console.log(this.mermaidContainer.nativeElement);
    }

    mermaid.mermaidAPI.render(this.graphId,this.graphDefinition, cb, this.mermaidContainer.nativeElement);
  }



}
