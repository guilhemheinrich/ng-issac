import { Component, OnInit, Output, Input, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Action, IAction, ActionType } from '../../processus';
import { UniqueIdentifier } from '../../../configuration';
import { ThesaurusDisplayComponent } from '../../../thesaurus/thesaurus-display/thesaurus-display.component';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class ActionDisplayComponent implements OnInit {

  @Input()
  action: Action;

  @Output()
  outAction: EventEmitter<[Action, Action]> = new EventEmitter<[Action, Action]>();

  @Input()
  editable: boolean = false;

  oldAction: Action;
  // For the autocomplete delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 500;

  actionTypes = [];

  @ViewChild('modal') modal: ElementRef;
  @ViewChild('thesaurusComponent') thesaurusComponent: ThesaurusDisplayComponent;

  constructor() { 
    let options = Object.values(ActionType);
    this.actionTypes = options;
  }

  ngOnInit() {
  }

  @HostListener('document:click', ['$event'])
  globalListener(event: Event) {
    if (event && event.target == this.modal.nativeElement) {
      this.closeModal();
    }
  }
  closeModal() {
    this.modal.nativeElement.style.display = "none";
    this.oldAction = null;
  }

  openModal() {
    this.oldAction = new Action(this.action);
    console.log('Action when opening the modal');
    console.log(this.oldAction);
    // if (this.action.agent && this.action.agent.uri) {
    //   // this.thesaurusComponent.onClickIdentifier(this.action.agent);
    //   var result = this.thesaurusComponent.searchUri(this.action.agent.uri);
    //   result.subscribe((response => {
    //     console.log("here");
    //     if (response['results']['bindings']) {
    //       console.log("or there");

    //       this.thesaurusComponent.computeGraphDefinition(this.action.agent, response['results']['bindings']);
    //     }
    //   }))
    // }
    this.modal.nativeElement.style.display = "block";
  }

  onThesaurusResult(thesaurusIdentifier: UniqueIdentifier) {
    // this.action = new Action(this.action);
    this.action.agent.name = thesaurusIdentifier.name;
    this.action.agent.uri = thesaurusIdentifier.uri;
  }

  onSubmitAction()
  {
    console.log('Action submitted : ');
    console.log(this.action);
    console.log('While old action were : ');
    console.log(this.oldAction);

    if (this.action.agent.uri === "") return;
    this.outAction.emit([this.oldAction, this.action]);
    this.oldAction = new Action(<IAction>JSON.parse(JSON.stringify(this.action)));
  }

}
