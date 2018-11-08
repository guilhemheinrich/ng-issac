import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as go from 'gojs';
import { IssacAgent, IIssacAgent } from 'src/app/issac-definitions/agent';
import { AgentDisplayerService } from 'src/app/processus/action/agent-displayer.service';
import { ProcessusService } from 'src/app/issac-processus/processus.service';
import { IssacProcessus } from 'src/app/issac-definitions/processus';
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

  // Displayer
  public displayer = undefined;

  // Agent creation information
  _agent: IssacAgent;

  // Link propriety setting
  _linkProprieties: {
    favorability: number,
  } = {favorability: 0};
  favorability_types = [
    {label: 'Unfavorable', value: 1, icon: 'fa fa-frown-o'},
    {label: 'Neutral', value: 0, icon: 'fa fa-meh-o'},
    {label: 'Favorable', value: -1, icon: 'fa fa-smile-o'}
  ];

  constructor(
    private agentDisplayerService: AgentDisplayerService,
    private processusService: ProcessusService,
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
    this.processusService.newProcessus$.subscribe((newProcessus) => {
      this.handleSubmittedProcessus(newProcessus);
    });

    // Some mock data
    let nodeDataArray = [
      { label: "Alpha", key: "Alpha", type: 'processus' },
      { label: "Beta", key: "Beta", type: 'agent' },
      { label: "Gamma", key: "Gamma", type: 'agent' },
    ];
    let linkDataArray = [
      { from: "Alpha", to: "Beta", text: "a label\non an\northo link" }
    ]
    this._diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    // To simplify this code we define a function for creating a context menu button:
    function makeButton(text, action, visiblePredicate?) {
      return $("ContextMenuButton",
        $(go.TextBlock, text),
        { click: action },
        // don't bother with binding GraphObject.visible if there's no predicate
        visiblePredicate ? new go.Binding("visible", "", function (o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
    }

    // a context menu is an Adornment with a bunch of buttons in them
    var partContextMenu =
      $(go.Adornment, "Vertical",
        makeButton("Properties",
          (e, obj) => {  // OBJ is this Button
            var contextmenu = obj.part;  // the Button is in the context menu Adornment
            var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
            // now can do something with PART, or with its data, or with the Adornment (the context menu)
            // if (part instanceof go.Link) console.log(part);
            if (part instanceof go.Link) this.setLinkData(part);
            // else if (part instanceof go.Group) alert(groupInfo(contextmenu));
            // else alert(nodeInfo(part.data));
          }),
        makeButton("Cut",
          function (e, obj) { e.diagram.commandHandler.cutSelection(); },
          function (o) { return o.diagram.commandHandler.canCutSelection(); }),
        makeButton("Copy",
          function (e, obj) { e.diagram.commandHandler.copySelection(); },
          function (o) { return o.diagram.commandHandler.canCopySelection(); }),
        makeButton("Paste",
          function (e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
          function (o) { return o.diagram.commandHandler.canPasteSelection(); }),
        makeButton("Delete",
          function (e, obj) { e.diagram.commandHandler.deleteSelection(); },
          function (o) { return o.diagram.commandHandler.canDeleteSelection(); }),
        makeButton("Undo",
          function (e, obj) { e.diagram.commandHandler.undo(); },
          function (o) { return o.diagram.commandHandler.canUndo(); }),
        makeButton("Redo",
          function (e, obj) { e.diagram.commandHandler.redo(); },
          function (o) { return o.diagram.commandHandler.canRedo(); }),
        makeButton("Group",
          function (e, obj) { e.diagram.commandHandler.groupSelection(); },
          function (o) { return o.diagram.commandHandler.canGroupSelection(); }),
        makeButton("Ungroup",
          function (e, obj) { e.diagram.commandHandler.ungroupSelection(); },
          function (o) { return o.diagram.commandHandler.canUngroupSelection(); })
      );


    this._diagram.nodeTemplate =
      $(go.Node, "Auto",  // the Shape automatically fits around the TextBlock
        $(go.Shape, "RoundedRectangle",  // use this kind of figure for the Shape
          // bind Shape.fill to Node.data.color
          new go.Binding("fill", "type", this.typeToCssProp),
          {
            portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
            // allow all kinds of links from and to this port
            fromLinkable: true, fromLinkableSelfNode: false, fromLinkableDuplicates: false,
            toLinkable: true, toLinkableSelfNode: false, toLinkableDuplicates: false
          }
        ),
        $(go.Panel, "Table",
          $(go.TextBlock,
            { row: 0, column: 0, margin: 2 },
            new go.Binding("text", "label")
          ),
          $(go.TextBlock,
            { row: 1, column: 0, margin: 2, background: "lightgray", visible: false },
            new go.Binding("text", "uri"),
            new go.Binding("visible", "", function (data) {
              if (!data.uri) return false;
              switch (data.type) {
                case 'processus':
                  return false;
                case 'agent':
                  return true;
              }
            }),
          ),
          $(go.TextBlock,
            { row: 1, column: 0, margin: 2, background: "lightgray", visible: false },
            new go.Binding("text", "description"),
            new go.Binding("visible", "description", function (s) { return !!s; }),
          )
        ),
        new go.Binding("location", "loc").makeTwoWay(go.Point.stringify),

      );

    this._diagram.linkTemplate =
      $(go.Link,        // the whole link panel
        {
          reshapable: true,
          // this context menu Adornment is shared by all links
          contextMenu: partContextMenu
          // routing: go.Link.AvoidsNodes,
          // corner: 5,
          // curve: go.Link.JumpOver
        },
        $(go.Shape),
        $(go.TextBlock, { textAlign: "center" },  // centered multi-line text
          new go.Binding("text", "text").makeTwoWay()));     // the link shape, default black stroke



    // Specify action when creating node : Processus or Agent
    this._diagram.doubleClick = (inputEvent) => {
      this._currentLocation = inputEvent.documentPoint;
      this.nodeDialogDisplay = true;
    }

    // Redeclare the insert link event
    var tool = this._diagram.toolManager.linkingTool;
    tool.insertLink = (fromnode, fromport, tonode, toport) => {
      // Check if a link already exist
      let allLinksOutOfTo = tonode.findLinksOutOf();
      let notDraw = allLinksOutOfTo.any((link) => {
        return link.toNode === fromnode;
      })
      if (notDraw) {
        return null;
      }

      let newLink: go.Link;
      // Comportment varying upon both ends
      let fromtype = fromnode.data.type;
      let totype = tonode.data.type;
      if (fromtype === 'processus' && totype === 'processus') {
        console.log('Link not yet allowed between processus');
        return null;
      } else {
        if (fromtype === 'agent' && totype === 'agent') {
          this._diagram.toolManager.linkingTool.archetypeLinkData = {
            text: 'Between agents',
          };
        } else {
          this._diagram.toolManager.linkingTool.archetypeLinkData = {
            text: 'Between an agent and a processus',
            type: 'involve',
            favorability: 0,
          };
        }
        newLink = go.LinkingTool.prototype.insertLink.call(tool, fromnode, fromport, tonode, toport);
      }
      return newLink;
    }
  }

  typeToCssProp(type) {
    switch (type) {
      case 'processus':
        return 'orange'
      case 'agent':
        return 'lightblue'
    }
  }

  setLinkData(part: go.Link) {
    // Open dialog with data

    var data = part.data
    this._linkProprieties = data;
    this.displayer = 'link';
    console.log('here')
    this.openLinkDataProprieties(data);
  }

  openLinkDataProprieties(data) {

    // this._diagram.model.startTransaction("setting propriety");
    // this._diagram.model.setDataProperty(data, "highlight", !data.highlight);
    // this._diagram.model.commitTransaction("flash");
  }

  showModelData() {
    console.log(this._diagram.model.nodeDataArray);
    console.log((<go.GraphLinksModel>this._diagram.model).linkDataArray);
  }

  openAgentPanel() {
    console.log('opening agent panel');
    this._agent = new IssacAgent();
    this.agentDisplayerService.display(this._agent, false);
  }

  openProcessusPanel() {
    console.log('opening processus panel');
    let processus = new IssacProcessus();
    this.processusService.display(processus, false);
  }

  handleSubmittedAgent(oldAndNewAgent: [IssacAgent, IssacAgent]) {
    if (!oldAndNewAgent) return;
    let oldAgent = oldAndNewAgent[0];
    this._agent = oldAndNewAgent[1];
    // Check that the agent is not already in the model
    let nodeExist = this._diagram.model.nodeDataArray.filter((node: { type, key }) => {
      return node.type === 'agent';
    }).some((agent: { key }) => {
      return agent.key === this._agent.uri;
    });
    // Insert if relevant
    if (!nodeExist) {
      this._diagram.model.addNodeData({
        loc: this._currentLocation,
        type: 'agent',
        label: this._agent.label,
        uri: this._agent.uri,
        key: this._agent.uri,
      });
    }

  }

  handleSubmittedProcessus(processus: IssacProcessus) {
    if (!processus) return;

    this._diagram.model.addNodeData({
      loc: this._currentLocation,
      type: 'processus',
      label: processus.label,
      uri: processus.generateUri(),
      key: processus.generateUri(),
      description: processus.description,
    });
    this.processusDialogDisplay = false;
  }

}
