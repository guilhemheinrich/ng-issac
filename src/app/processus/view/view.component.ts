import { HostListener, Component, OnInit, Input, OnChanges, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { Processus, Action, ActionType, IAction } from '../processus';
import { GlobalVariables, hash32, UniqueIdentifier } from '../../configuration';
import {ThesaurusDisplayComponent} from '../../thesaurus/thesaurus-display/thesaurus-display.component';
import { ActionDisplayComponent } from '../action/display/display.component';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css', '../edit/edit.component.css'],
})
export class ViewComponent implements OnInit {

  @Input()
  editable: boolean = false;


  @Output()
  emittedAction: EventEmitter<Action> = new EventEmitter<Action>();

  @Input()
  processus: Processus = new Processus();
  processusGraphDefinition: string;
  inputAgents   : UniqueIdentifier[] = [];
  outputAgents  : UniqueIdentifier[] = [];
  inoutAgents   : UniqueIdentifier[] = [];

  action: Action = new Action();
  actionTypes = [];

  @ViewChild('modal') 
  modal: ElementRef;

  @ViewChild('actionComponent') actionComponent: ActionDisplayComponent;

  constructor() {
    let options = Object.values(ActionType);
    this.actionTypes = options;
   }

  ngOnInit() {
  }

  ngOnChanges() {

    // console.log('onChange');
    var inputElements = this.processus.inputs.map((input) => {
      return input.agent.uri;
    });
    var outputElements = this.processus.outputs.map((output) => {
      return output.agent.uri;
    });

    var commonIndexInput: number[] = [];
    var commonIndexOutput: number[] = [];
    inputElements.forEach((input, index) => {
      let indexInOut = outputElements.indexOf(input);
      // indexOf return -1 if no match were found
      if (indexInOut != -1) {
        commonIndexOutput.push(indexInOut);
        commonIndexInput.push(index);
      }
    })
  
    this.inputAgents    = <UniqueIdentifier[]>[];
    this.outputAgents   = <UniqueIdentifier[]>[];
    this.inoutAgents    = <UniqueIdentifier[]>[];
    commonIndexInput.forEach((commonIndex) => {
      this.inoutAgents.push(this.processus.inputs[commonIndex].agent);
    })
    this.processus.inputs.forEach((input, index) => {
      if (commonIndexInput.indexOf(index) == -1) {
        this.inputAgents.push(input.agent);
      }
    });
    this.processus.outputs.forEach((output, index) => {
      if (commonIndexOutput.indexOf(index) == -1) {
        this.outputAgents.push(output.agent);
      }
    });
    this.computeGraphDefinition();
  }

  handleSubmittedAction($event)
  {
    this.emittedAction.emit($event);
  }

  onClickNode(agent: UniqueIdentifier, actionType: ActionType) {

    this.action = new Action(<IAction>{
      agent: agent,
      type: actionType
    });
    console.log('From view component, cliked action is :')
    console.log(this.action);
    this.actionComponent.openModal();
    // this.openModal();
    // this.thesaurus.onClickIdentifier(agent);
  }

  private _postProcess($event: any)
  {
    this.inputAgents.forEach(((input, index) => 
    {
      let node = document.getElementById('I' + index);
      node.addEventListener("click", () =>this.onClickNode(input, ActionType.INPUT));
      // node.dataset.uri 
    }));
    this.outputAgents.forEach(((output, index) => 
    {
      let node = document.getElementById('O' + index);
      node.addEventListener("click", () =>this.onClickNode(output, ActionType.OUTPUT));
    }));
    this.inoutAgents.forEach(((inout, index) => 
    {
      let node = document.getElementById('IO' + index);
      node.addEventListener("click", () =>this.onClickNode(inout, ActionType.INOUT));
    }));
  }

  computeGraphDefinition() {
    this.processusGraphDefinition = `
    graph RL;\n
    classDef thesaurusMermaid:hover cursor:pointer, fill:aquamarine;
  `;
    this.processusGraphDefinition += `
    This[${this.processus.name}]\n
  `;



    this.inputAgents.forEach((input, index) => {
      this.processusGraphDefinition += `I${index}("${input.name}")-->This;\n`;
      this.processusGraphDefinition += `class I${index} inputMermaid;\n`
    });

    this.outputAgents.forEach((output, index) => {
      this.processusGraphDefinition += `This-->O${index}("${output.name}");\n`;
      this.processusGraphDefinition += `class O${index} outputMermaid;\n`
    });

    this.inoutAgents.forEach((inout, index) => {
      this.processusGraphDefinition += `This-->IO${index}("${inout.name}");\n`;
      this.processusGraphDefinition += `IO${index}-->This;\n`;
      this.processusGraphDefinition += `class IO${index} inoutMermaid;\n`
    });
  }

}
