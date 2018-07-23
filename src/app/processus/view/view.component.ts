import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Processus} from '../processus';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  @Input()
  processus: Processus = new Processus();
  processusGraphDefinition: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges()
  {
    console.log(this.processus);
    console.log('i changed in view component!');
    this.computeGraphDefinition();
    console.log(this.processusGraphDefinition);
  }

  computeGraphDefinition()
  {
    this.processusGraphDefinition = `
    graph TB;\n
    classDef thesaurusMermaid:hover cursor:pointer, fill:aquamarine;
  `;
  this.processusGraphDefinition += `
    This[${this.processus.name}]\n
  `;
  this.processus.inputs.forEach((input, index) => {
    this.processusGraphDefinition += `I${index}("${input.agent.name}")-->This;\n`;
    this.processusGraphDefinition += `class I${index} inputMermaid;\n`
  })

  this.processus.outputs.forEach((output, index) => {
    this.processusGraphDefinition += `This-->O${index}("${output.agent.name}");\n`;
    this.processusGraphDefinition += `class O${index} outputMermaid;\n`
  })
  }
}
