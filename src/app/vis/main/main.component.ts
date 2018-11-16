import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Canal } from 'src/app/communication';
import { Agent } from 'src/app/models/Agent';
import { Processus } from 'src/app/models/Processus';
import { APRelationship } from 'src/app/models/APRelationship';
// import { IssacProcessus } from 'src/app/issac-definitions/processus';
// import { IssacAgent } from 'src/app/issac-definitions/agent';
// import { IssacRelationship, IIssacRelationship } from 'src/app/issac-definitions/relationship';
import * as vis from 'vis';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // Communications canal
  processusCanal = new Canal<Processus>();
  agentCanal = new Canal<Agent>();

  // Data
  agents: Agent[] = [];
  processus: Processus[] = [];
  relationships: { processusUri: string, agentUri: string, data: {} }[] = [];

  // Data - visualisation bindings
  private _usedIds: Set<number> = new Set();
  private _agentsId: Set<{ id: any, data: Agent }> = new Set();
  private _processusId: Set<{ id: any, data: Processus }> = new Set();
  // private _relationshipsId: Set<{ id: any, data: IssacRelationship }> = new Set();


  // Graph stuff
  public network: vis.Network;
  @ViewChild('visContainer')
  public container: ElementRef;

  public nodes = new vis.DataSet<vis.Node>([
    { id: "bdkljcfheriu", label: "one" },
    { id: -2, label: "two" },
    { id: -3, label: "three" },
    { id: -4, label: "four" },
    { id: -5, label: "fivr" },
  ]);

  public edges = new vis.DataSet<vis.Edge>([
    // { from: 1, to: 3 },
  ]);


  public options = {
    // configure: {enabled: true},
    edges: { smooth: false },
    physics: { enabled: false },
    interaction: {
      zoomView: false,
      dragView: false,
      // navigationButtons: true
    }
  };
  private shiftPress = false;


  @HostListener('document:keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent) {
    // console.log(`The user just pressed ${ev.key}!`);
    this.shiftPress = ev.shiftKey;
    // if (ev.shiftKey) {
    //   console.log('here')
    //   this.network.setOptions({
    //     interaction: {
    //       dragNodes: false
    //     }
    //   });
    // }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent) {
    this.shiftPress = ev.shiftKey;
    // this.network.setOptions({
    //   interaction: {
    //     dragNodes: true
    //   }
    // });
  }
  private _canvasPosition: { x: number, y: number } = { x: 0, y: 0 };
  // Used in drag event
  private _lastSelected: any;
  private _nodeSelectedStart: number;
  private _nodeSelectedEnd: number;

  constructor() {

  }

  sendSomeProcessus() {
    let processus = new Processus();
    processus.label = 'awesome';
    this.processusCanal.passIn(processus);

  }



  ngOnInit() {

    this.processusCanal.flowOut$.subscribe((obj) => {
      if (!obj) return;
      console.log(obj.data.label);

    });

    this.agentCanal.flowOut$.subscribe((obj) => {
      if (!obj) return;
      console.log(obj.data.prefLabel);

      this.addAgent(obj.data);
    })

    // provide the data in the vis format
    let data = {
      nodes: this.nodes,
      edges: this.edges
    };

    this.network = new vis.Network(this.container.nativeElement, data, this.options);

    // Events
    this.network.on("click", (params) => {
      new Agent();
      // new IssacRelationship();
      console.log(this._lastSelected)
      console.log(this.network.getSelectedNodes())
      if (this.network.getSelectedNodes().length > 0) {
        if (this._lastSelected && this.shiftPress) {          
          // this.addRelationship(this._lastSelected, this.network.getSelectedNodes()[0]);
        }
        this._lastSelected = this.network.getSelectedNodes()[0];

      } else {
        this._lastSelected = undefined;
      }
      // if (this.network.getSelectedNodes()[0] && this._lastSelected && this.shiftPress) {
      //   console.log('edging !');
      //   this.addRelationship(params.nodes[0], Number(this.network.getSelectedNodes()[0]);
      // }

      // console.log(this._nodeSelectedStart);
      // console.log(this._nodeSelectedEnd);
      // if (this._nodeSelectedStart) {
      //   this._nodeSelectedEnd = params.nodes[0];
      //   if (this.shiftPress) {
      //     this.addRelationship(this._nodeSelectedStart, this._nodeSelectedEnd);
      //   }
      //   this._nodeSelectedStart = undefined;
      //   this._nodeSelectedEnd = undefined;
      // } else {
      //   this._nodeSelectedStart = params.nodes[0];
      // }
    })
    this.network.on("doubleClick", (params) => {
      this._canvasPosition = params.pointer.canvas;
      this.agentCanal.passIn(new Agent());
    });
  }

  ngAfterViewInit() {


  }


  // Graph related function

  // getUniqueId() {
  //   // Don't put an id to 0 !
  //   let cpt = 1;
  //   while (this._usedIds.has(cpt) && cpt < 10000) {
  //     cpt++;
  //   }
  //   return cpt;
  // }

  addNode() {
    console.log('add node');


  }

  openAgentPanel() {
    this.agentCanal.passIn(new Agent());
  }

  addAgent(agent: Agent) {
    // Find an available id
    // let agentUniquenessCheck = !Array.from(this._agentsId).some((ele) => {
    //   return ele.data.uri === agent.uri;
    // })
    // if (agentUniquenessCheck) {
    //   // Proceed
    // } else {
    //   return;
    // }
    // Register it
    // this._usedIds.add(_id);
    let _id = agent.uri;
    
    // Associate data to the id
    this._agentsId.add({ id: _id, data: agent });
    // Draw
    this.nodes.add({ id: _id, label: agent.prefLabel, x: this._canvasPosition.x, y: this._canvasPosition.y });
  }

  addProcessus(processus: Processus) {
    // Find an available id
    let _id = processus.uri;
    // Register it
    // this._usedIds.add(_id);
    // Associate data to the id
    this._processusId.add({ id: _id, data: processus });
    // Draw
    this.nodes.add({ id: _id, label: processus.label, x: this._canvasPosition.x, y: this._canvasPosition.y });
  }

  // addRelationship(relationship: IssacRelationship) {
  //   // Logical check
  //   if (!this.checkRelationship(relationship)) return;
  //   // Find an available id
  //   let _id = this.getUniqueId();
  //   // Register it
  //   this._usedIds.add(_id);
  //   // Associate data to the id
  //   this._relationshipsId.add({ id: _id, data: relationship });
  //   // Draw
  //   let node1Id = this.retrieveObjectFromPropriety<{ uri: string }>(relationship.subject.uri, new Set([...this._processusId, ...this._agentsId]), "uri").id;
  //   let node2Id = this.retrieveObjectFromPropriety<{ uri: string }>(relationship.object.uri, new Set([...this._processusId, ...this._agentsId]), "uri").id;
  //   this.edges.add({ from: node1Id, to: node2Id });
  // }

  addRelationship(node1Id: any, node2Id: any, options?: Object) {
    // // Find an available id
    // let _id = this.getUniqueId();
    // // Register it
    // this._usedIds.add(_id);
    // Create realationship instance

    let allNodes = new Set([...Array.from(this._processusId), ...Array.from(this._agentsId)]);
    let subject = this.retrieveObjectFromId(node1Id, allNodes);
    let object = this.retrieveObjectFromId(node2Id, allNodes);
    console.log(subject.data)
    console.log(object.data)
    // let relationship = new IssacRelationship({ subject: subject.data, object: object.data });
    // // // Associate data to the id
    console.log('should edging')
    let out = this.edges.add({ from: node1Id, to: node2Id });
    // let out = this.edges.add({ from: node1Id, to: node2Id });
    // this._relationshipsId.add({ id: out[0], data: relationship });
    console.log(this.edges);
  }

  // checkRelationship(relationship: IssacRelationship) {
  //   if ((relationship.subject instanceof IssacAgent && relationship.object instanceof IssacProcessus) ||
  //     (relationship.object instanceof IssacAgent && relationship.subject instanceof IssacProcessus)) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  retrieveObjectFromPropriety<OBJ>(proprietyValue: any, set: Set<{ id: number, data: OBJ }>, propriety: keyof OBJ) {
    return Array.from(set).reduce((previousValue, currentValue, currentIndex) => {
      if (currentValue.data[propriety] === proprietyValue) {
        return currentValue;
      } else {
        return previousValue;
      }
    }, undefined);
  }

  retrieveObjectFromId(id: any, set: Set<{ id: any, data: any }>) {
    return Array.from(set).reduce((previousValue, currentValue, currentIndex) => {
      if (currentValue.id === id) {
        return currentValue;
      } else {
        return previousValue;
      }
    }, undefined);
  }


  getData() {
    new Agent();
    // new IssacRelationship();
    console.log(this.nodes);
    console.log(this.edges);
    console.log(this.network.getSelection());
  }

}
