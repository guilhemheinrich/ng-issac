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
    graph RL;\n
    classDef thesaurusMermaid:hover cursor:pointer, fill:aquamarine;
  `;
  this.processusGraphDefinition += `
    This[${this.processus.name}]\n
  `;


  var inputElements = this.processus.inputs.map((input) => {
    return input.agent.uri;
  });
  var outputElements = this.processus.outputs.map((output) => {
    return output.agent.uri;
  });

  var commonIndexInput = [];
  var commonIndexOutput = [];
  inputElements.forEach((input, index) => {
    let indexInOut = outputElements.indexOf(input);
    if (indexInOut) {
      commonIndexOutput.push(indexInOut);
      commonIndexInput.push(index);
    }
  })

  let inputAgents = [];
  let outputAgents = [];
  let inoutAgents = [];
  commonIndexInput.forEach((commonIndex) => 
{
  inoutAgents.push(this.processus.inputs[commonIndex].agent);
})

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
