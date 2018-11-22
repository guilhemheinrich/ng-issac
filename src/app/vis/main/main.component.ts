import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Canal } from 'src/app/communication';
import { Agent } from 'src/app/models/Agent';
import { Processus } from 'src/app/models/Processus';
import { APRelationship,Processus_Agent_Impact } from 'src/app/models/APRelationship';
import { issacNode, issacEdge } from './CustomVisClass'
import * as vis from 'vis';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // Displaying
  nodeDialogDisplay = false;
  selectedElement: Processus | Agent | APRelationship;
  favorability_types = [
    {label: 'Unfavorable', value: Processus_Agent_Impact.Negative, icon: 'fa fa-frown-o'},
    {label: 'Neutral', value: Processus_Agent_Impact.None, icon: 'fa fa-meh-o'},
    {label: 'Favorable', value: Processus_Agent_Impact.Positive, icon: 'fa fa-smile-o'}
  ];
  // Communications canals
  processusCanal = new Canal<Processus>();
  agentCanal = new Canal<Agent>();


  // Graph stuff
  public network: vis.Network;
  @ViewChild('visContainer')
  public container: ElementRef;

  public nodes = new vis.DataSet<issacNode>([]);
  public edges = new vis.DataSet<issacEdge>([]);





  private _processusColor = {
    border: "#b27608",
    background: "#ffb01e",
    highlight: {
      border: "#b27608",
      background: "#ffc251",
    },
    hover: {
      border: "#b27608",
      background: "#ffb01e",
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
      // zoomView: false,
      // dragView: false,
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

  constructor() {

  }

  ngOnInit() {

    this.processusCanal.flowOut$.subscribe((obj) => {
      if (!obj) return;
      let new_id = this.addProcessus(obj.data)
      // Auto select the newly created processus
      this.network.selectNodes([new_id]);
    });

    this.agentCanal.flowOut$.subscribe((obj) => {
      if (!obj) return;
      let new_id = this.addAgent(obj.data);
      // Auto select the newly created agent
      if (new_id) {

        this.network.selectNodes([new_id]);
      }
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
    this.network.on("select", (params) => {
      console.log(this.network.getSelectedNodes().length);
            /* selectEdge is fired when a connected node is selected
      Checking the size of actualy selectedNode seems a reliable way to determine 
      if it's an edge or a node that is intended to be selected
      */
     let isMainSelectionEdge = this.network.getSelectedNodes().length === 0;
     if (isMainSelectionEdge) {
       let selectedEdge = this.edges.get(this.network.getSelectedEdges()[0]);
       this.selectedElement = selectedEdge.data;
     } else {
      let selectedNode = this.nodes.get(this.network.getSelectedNodes()[0]);
      this.selectedElement = selectedNode.data;
     }
    })
    
    this.nodes.on('*', function (event, properties, senderId) {
      console.log('event', event, properties);
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
    this.nodes.add({ id: _id, label: agent.prefLabel, x: this._canvasPosition.x, y: this._canvasPosition.y, data: agent });
    return _id;
  }

  addProcessus(processus: Processus) {
    // Find an available id
    let _id = processus.uri;
    this.nodes.add({ id: _id, label: processus.label, x: this._canvasPosition.x, y: this._canvasPosition.y, color: this._processusColor, data: processus });
    return _id;
  }

  private _nodesToAgentsAndProcessus(item1: Agent | Processus, item2: Agent | Processus) {
    if (item1 instanceof Processus && item2 instanceof Agent ||
      item1 instanceof Agent && item2 instanceof Processus) {
      return {
        agent: item1 instanceof Agent ? item1 : item2,
        processus: item2 instanceof Processus ? item2 : item1,
      };
    } else {
      return null;
    }
  }

  addRelationship(node1Id: any, node2Id: any, options?: Object) {

    let item1 = this.nodes.get(<vis.IdType>node1Id).data
    let item2 = this.nodes.get(<vis.IdType>node2Id).data
    let agentAndProcessus = this._nodesToAgentsAndProcessus(item1, item2)

    console.log(agentAndProcessus)
    if (agentAndProcessus) {
      let relationship = new APRelationship(options = agentAndProcessus)
      // If no links exists we add a link
      let edgeAlreadyExists = this.edges.getIds()
        .some((id) => {
          console.log(id)
          return relationship.uri === id;
        });
      if (!edgeAlreadyExists) {
        this.edges.add({ id: relationship.uri, from: node1Id, to: node2Id, data: relationship });
      } else {
        console.log('Link already exits')
        return false;
      }
    } else {
      console.log('Not a valide link');
      return false;
    }

  }

}
