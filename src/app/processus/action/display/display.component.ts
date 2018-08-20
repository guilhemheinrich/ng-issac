import { Component, OnInit, Output, Input, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Action, IAction, ActionType } from '../../processus';
import { UniqueIdentifier, GlobalVariables } from '../../../configuration';
import { ThesaurusDisplayComponent } from '../../../thesaurus/thesaurus-display/thesaurus-display.component';
import {ActionDisplayerService} from '../action-displayer.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class ActionDisplayComponent implements OnInit {

  agentRootElement = [GlobalVariables.NAMED_INDIVIDUALS.taxonomic_classification_of_organisms]

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

  closeResult: string;

  @ViewChild('modal') modal: ElementRef;
  @ViewChild('thesaurusComponent') thesaurusComponent: ThesaurusDisplayComponent;

  constructor(
    private actionDisplayerService: ActionDisplayerService,
    private modalService: NgbModal,
  ) { 
    let options = Object.values(ActionType);
    this.actionTypes = options;

  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  ngOnInit() {
    this.actionDisplayerService.displayIn$.subscribe((action) =>
    {
      this.openModal(action);
    });
  }

  ngAfterViewInit() {
    this.closeModal();
    this.modal.nativeElement.style.display = "none";
  }
  

  ngAfterContentInit() {
    this.closeModal();
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

  openModal(action?: Action) {

    this.oldAction = new Action(<IAction>JSON.parse(JSON.stringify(action)));
    this.action = new Action(<IAction>JSON.parse(JSON.stringify(action)));
    this.modal.nativeElement.style.display = "block";
  }

  onThesaurusResult(thesaurusIdentifier: UniqueIdentifier) {
    this.action.agent.name = thesaurusIdentifier.name;
    this.action.agent.uri = thesaurusIdentifier.uri;
  }

  onSubmitAction()
  {
    if (this.action.agent.uri === "") return;
    this.actionDisplayerService.output(this.oldAction, this.action);
    this.oldAction = new Action(<IAction>JSON.parse(JSON.stringify(this.action)));
  }

  onReset()
  {
    this.action     = new Action();
    this.oldAction  = new Action();
  }

  onDelete()
  {
    this.action     = new Action();
    this.outAction.emit([this.oldAction, this.action]);
    this.oldAction  = new Action();
  }

  togglePanel(id: string)
  {
    let toggledElement = $(`.myCollapse#${id}`);
    
    if (toggledElement.css('display') === 'none') {
      $('.myCollapse').css('display', 'none');
      toggledElement.css('display', 'inline');
      console.log(toggledElement);
    } else {
      toggledElement.css('display', 'none');
    }
  }
}
