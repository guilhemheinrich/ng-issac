import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as go from 'gojs';
import { IssacAgent, IIssacAgent } from 'src/app/issac-definitions/agent';
import { AgentDisplayerService } from 'src/app/processus/action/agent-displayer.service';
@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.css']
})
export class BasicComponent implements OnInit {

  @ViewChild('basicDiag')
  private _diagramRef: ElementRef;

  nodeDialogDisplay = false;
  processusDialogDisplay = false;
  _diagram: go.Diagram;
  _currentLocation = new go.Point();

  // Agent creation information
  _agent: IssacAgent;

  constructor(
    private agentDisplayerService: AgentDisplayerService,
  ) {
    this._diagram = new go.Diagram();
    this._diagram.initialContentAlignment = go.Spot.Center;
    this._diagram.undoManager.isEnabled = true;
  }

  ngOnInit() {
    this._diagram.div = this._diagramRef.nativeElement;
    let $ = go.GraphObject.make;

    // Subscribe to services
    this.agentDisplayerService.oldToNewAgent$.subscribe((oldAndNewAgent) => {
      this.handleSubmittedAgent(oldAndNewAgent);
    });



    this._diagram.nodeTemplate =
      $(go.Node, "Auto",  // the Shape automatically fits around the TextBlock
        $(go.Shape, "RoundedRectangle",  // use this kind of figure for the Shape
          // bind Shape.fill to Node.data.color
          new go.Binding("fill", "type", this.typeToCssProp),
          {
            portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
            // allow all kinds of links from and to this port
            fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
            toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
          }
          ),
        $(go.Panel, "Table",
          $(go.TextBlock,
            { row: 0, column: 0, margin: 2 },
            new go.Binding("text", "title")),
          $(go.TextBlock,  // column 11 -- nothing in columns 1-10
            { row: 1, column: 0, margin: 2, background: "lightgray" },
            new go.Binding("text", "uri"))
        ),
        new go.Binding("location", "loc").makeTwoWay(go.Point.stringify),
      );

    this._diagram.linkTemplate =
      $(go.Link,        // the whole link panel
      $(go.Shape));     // the link shape, default black stroke


    // Specify action when creating node : Processus or Agent 
    this._diagram.doubleClick = (inputEvent) => {
      this._currentLocation = inputEvent.documentPoint;
      this.nodeDialogDisplay = true;
      // this.addProcessus();
    }

    // this._diagram.click

  }

  typeToCssProp(type) {
    switch (type) {
      case 'processus':
        return 'orange'
      case 'agent':
        return 'lightblue'
    }
  }

  openAgentPanel() {
    console.log('opening agent panel');
    this._agent = new IssacAgent();
    this.agentDisplayerService.display(this._agent, false);
  }

  handleSubmittedAgent(oldAndNewAgent: [IssacAgent, IssacAgent]) {
    if (!oldAndNewAgent) return;
    let oldAgent = oldAndNewAgent[0];
    this._agent = oldAndNewAgent[1];
    this._diagram.model.addNodeData({
      loc: this._currentLocation,
      type: 'agent',
      title: this._agent.label,
      uri: this._agent.uri,
      key: this._agent.uri,
    });
  }
  addProcessus(loc?: go.Point, data?: Object) {

    let location;
    if (loc) {
      location = loc;
    } else {
      location = this._currentLocation;
    }
    this._diagram.model.addNodeData({
      loc: location,
      type: 'processus',
      title: 'First Processus'
    });

  }
}
