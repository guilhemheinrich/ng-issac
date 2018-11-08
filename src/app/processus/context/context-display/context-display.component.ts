import { Component, OnInit, Output, Input, EventEmitter, ElementRef, ViewChild, HostListener} from '@angular/core';
import {ContextDisplayerService} from '../context-displayer.service';
import { UniqueIdentifier, GlobalVariables } from '../../../configuration';
import { IssacContext, IIssacContext } from '../../../issac-definitions/context';
import { IssacLocation, IIssacLocation } from '../../../issac-definitions/location';
import { ThesaurusDisplayComponent } from '../../../thesaurus/thesaurus-display/thesaurus-display.component';
import { IssacAgent } from '../../../issac-definitions/agent';
@Component({
  selector: 'app-context-display',
  templateUrl: './context-display.component.html',
  styleUrls: ['./context-display.component.css']
})
export class ContextDisplayComponent implements OnInit {

  displayModal = false;
  contextRootElement = [GlobalVariables.NAMED_INDIVIDUALS.geographical_locations]
  agentRootElement = [GlobalVariables.NAMED_INDIVIDUALS.taxonomic_classification_of_organisms]
  @Input()
  context: IssacContext;
  oldContext: IssacContext;
  @Output()
  outContext: EventEmitter<[IssacContext, IssacContext]> = new EventEmitter<[IssacContext, IssacContext]>();

  @Input()
  editable: boolean = false;

  @ViewChild('modal2') modal: ElementRef;
  @ViewChild('thesaurusComponent') thesaurusComponent: ThesaurusDisplayComponent;
  constructor(
    private contextDisplayerService: ContextDisplayerService,
  ) { }

  ngOnInit() {
    this.contextDisplayerService.displayIn$.subscribe((contextAndEditable) =>
    {
      if (contextAndEditable) {
        this.editable = contextAndEditable.editable;
        this.openModal(contextAndEditable.context);
      }
    });
  }
  ngAfterViewInit() {
    this.closeModal();
  }
  

  ngAfterContentInit() {
    this.closeModal();
  }

  @HostListener('document:click', ['$event'])
  globalListener(event: Event) {
    // if (event && event.target == this.modal.nativeElement) {
    //   this.closeModal();
    // }
  }

  openModal(context?: IssacContext) {
    this.oldContext = new IssacContext(<IIssacContext>JSON.parse(JSON.stringify(context)));
    this.context = new IssacContext(<IIssacContext>JSON.parse(JSON.stringify(context)));
    // this.modal.nativeElement.style.display = "block";
    this.displayModal = true;
  }

  closeModal() {
    // this.modal.nativeElement.style.display = "none";
    this.displayModal = false;

    this.oldContext = null;
  }


  onSubmitContext()
  {
    if (this.context.uri === "") {
      this.context.generateUri();
    }
    this.contextDisplayerService.output(this.oldContext, this.context);
    this.oldContext = new IssacContext(<IIssacContext>JSON.parse(JSON.stringify(this.context)));
    this.closeModal();
  }


  onLocationResult(location: UniqueIdentifier) {
    this.context.location.label = location.name;
    this.context.location.uri = location.uri;
  }

  onPrimaryPlantResult(primaryPlant: UniqueIdentifier)
  {
    this.context.primaryPlant.label = primaryPlant.name;
    this.context.primaryPlant.uri   = primaryPlant.uri;
  }

  togglePanel(id: string)
  {
    let toggledElement = $(`.myCollapse#${id}`);
    
    if (toggledElement.css('display') === 'none') {
      $('.myCollapse').css('display', 'none');
      toggledElement.css('display', 'inline');
    } 
  }

  onDelete()
  {
    this.context     = new IssacContext();
    this.outContext.emit([this.oldContext, this.context]);
    this.oldContext  = new IssacContext();
    this.closeModal();
  }
}
