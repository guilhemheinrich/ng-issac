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

  // Displaying
  nodeDialogDisplay = false;

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
  private _relationshipsId: Set<{ id: any, data: APRelationship }> = new Set();


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


  private _processusColor = {
    border:"#b27608",
    background:"#ffb01e",
    highlight:{
      border:"#b27608",
      background:"#ffc251",
    },
    hover: {
      border:"#b27608",
      background:"#ffb01e",
    }

  }

  public options = {
    // configure: {enabled: true},
    nodes: {
      shape: 'box',
      borderWidth: 1
    },
    edges: { 
      smooth: false,
      color: {
        color: 'black'
      }
       },
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
    this.shiftPress = ev.shiftKey;
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent) {
    this.shiftPress = ev.shiftKey;
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
      this.addProcessus(obj.data)
    });

    this.agentCanal.flowOut$.subscribe((obj) => {
      if (!obj) return;
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
      if (this.network.getSelectedNodes().length > 0) {
        if (this._lastSelected && this.shiftPress) {
          this.addRelationship(this._lastSelected, this.network.getSelectedNodes()[0]);
          this.network.selectNodes([this._lastSelected]);
        }
        this._lastSelected = this.network.getSelectedNodes()[0];

      } else {
        this._lastSelected = undefined;
      }
    })
    this.network.on("doubleClick", (params) => {
      this._canvasPosition = params.pointer.canvas;
      this.nodeDialogDisplay = true;
    });
  }

  openAgentPanel() {
    this.agentCanal.passIn(new Agent());
  }

  openProcessusPanel() {
    this.processusCanal.passIn(new Processus());
  }

  addAgent(agent: Agent) {

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
    this.nodes.add({ id: _id, label: processus.label, x: this._canvasPosition.x, y: this._canvasPosition.y, color: this._processusColor});
  }


  relationshipValidity(item1, item2) {
    // Check if the grammar is correct : we want an agent and a processus
    if (item1 instanceof Processus && item2 instanceof Agent ||
      item1 instanceof Agent && item2 instanceof Processus) {
        return {
          agent: item1 instanceof Agent ? item1 : item2,
          processus: item2 instanceof Processus ? item2 : item1,
        };
      } else {
        return false;
      }
  }

  addRelationship(node1Id: any, node2Id: any, options?: Object) {
    let allNodes = new Set([...Array.from(this._processusId), ...Array.from(this._agentsId)]);
    let subject = this.retrieveObjectFromId(node1Id, allNodes);
    let object = this.retrieveObjectFromId(node2Id, allNodes);
    let valid = this.relationshipValidity(subject.data, object.data)
    if (valid) {
      console.log(valid);
      let relationship = new APRelationship(options = valid);
      if (!Array.from(this._relationshipsId)
                .map(ele => ele.id)
                .some(id => id === relationship.uri)
        ){
          console.log(relationship.uri + ' in ' )
          console.log(this._relationshipsId)
          // Associate data to the id
         let out = this.edges.add({ from: node1Id, to: node2Id }, relationship.uri);
         this._relationshipsId.add({ id: relationship.uri, data: relationship });
        } else {
          console.log('Link already exits')
        }
    } else {
      console.log('Not a valide link');
    }

  }


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
