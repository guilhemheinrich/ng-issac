import { Component, OnInit, Output, Input, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Action, IAction, ActionType } from '../../processus';
import { UniqueIdentifier, GlobalVariables } from '../../../configuration';
import { ThesaurusDisplayComponent } from '../../../thesaurus/thesaurus-display/thesaurus-display.component';
import {AgentDisplayerService} from '../agent-displayer.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { IssacAgent, IIssacAgent } from '../../../issac-definitions/agent';
@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class ActionDisplayComponent implements OnInit {

  agentRootElement = [GlobalVariables.NAMED_INDIVIDUALS.taxonomic_classification_of_organisms]

  @Input()
  agent: IssacAgent;

  @Output()
  outAgent: EventEmitter<[IssacAgent, IssacAgent]> = new EventEmitter<[IssacAgent, IssacAgent]>();

  @Input()
  editable: boolean = false;

  oldAgent: IssacAgent;
  // For the autocomplete delay, in millisecond
  typingTimer: any;
  typingTimeout: number = 500;

  // actionTypes = [];

  closeResult: string;

  @ViewChild('modal') modal: ElementRef;
  @ViewChild('thesaurusComponent') thesaurusComponent: ThesaurusDisplayComponent;

  constructor(
    private agentDisplayerServiceAgent: AgentDisplayerService,
    private modalService: NgbModal,
  ) { 


  }

  open(content, editable = false) {
    this.editable = editable;
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
    this.agentDisplayerServiceAgent.displayIn$.subscribe((agentAndEditable) =>
    {
      if (agentAndEditable) {
        this.editable = agentAndEditable.editable;
        this.openModal(agentAndEditable.agent);
      }
    });
  }

  ngAfterViewInit() {
    this.closeModal();
    // this.modal.nativeElement.style.display = "none";
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
    this.oldAgent = null;
  }

  openModal(agent?: IssacAgent) {
    this.oldAgent = new IssacAgent(<IIssacAgent>JSON.parse(JSON.stringify(agent)));
    this.agent = new IssacAgent(<IIssacAgent>JSON.parse(JSON.stringify(agent)));
    this.modal.nativeElement.style.display = "block";
  }

  onThesaurusResult(thesaurusIdentifier: UniqueIdentifier) {
    this.agent.label = thesaurusIdentifier.name;
    this.agent.uri = thesaurusIdentifier.uri;
  }

  onSubmitAgent()
  {
    if (this.agent.uri === "") return;
    this.agentDisplayerServiceAgent.output(this.oldAgent, this.agent);
    this.oldAgent = new IssacAgent(<IIssacAgent>JSON.parse(JSON.stringify(this.agent)));
    this.closeModal();
  }

  onReset()
  {
    this.agent     = new IssacAgent();
    this.oldAgent  = new IssacAgent();
  }

  onDelete()
  {
    this.agent     = new IssacAgent();
    this.outAgent.emit([this.oldAgent, this.agent]);
    this.oldAgent  = new IssacAgent();
    this.closeModal();
  }

  togglePanel(id: string)
  {
    let toggledElement = $(`.myCollapse#${id}`);
    
    if (toggledElement.css('display') === 'none') {
      $('.myCollapse').css('display', 'none');
      toggledElement.css('display', 'inline');
    } else {
      toggledElement.css('display', 'none');
    }
  }
}
