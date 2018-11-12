import { Component, OnInit } from '@angular/core';
import { Canal } from 'src/app/communication';
import { IssacProcessus } from 'src/app/issac-definitions/processus';
import { IssacAgent } from 'src/app/issac-definitions/agent';
declare let $jit: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  processusCanal = new Canal<IssacProcessus>();
  agentCanal = new Canal<IssacAgent>();

  public fd;
  private _agent = new IssacAgent();
  constructor() {

  }

  sendSomeProcessus() {
    let processus = new IssacProcessus();
    processus.label = 'awesome';
    this.processusCanal.passIn(processus);
  }

  // init data
  public json = [
    {
      "data": {
        "$color": "#83548B",
        "$type": "none",
        "$alpha": 0
      },
      "id": "graphnode0",
      "name": "graphnode0"
    }
  ];


  ngOnInit() {

    this.processusCanal.flowOut$.subscribe((obj) => {
      if (!obj) return;
      console.log(obj.data.label);

    });

    this.agentCanal.flowOut$.subscribe((obj) => {
      if (!obj) return;
      console.log(obj.data.label);

      this.addAgent(obj.data);
    })

    var fd = new $jit.ForceDirected({
      //id of the visualization container
      injectInto: 'infovis',
      //Enable zooming and panning
      //with scrolling and DnD
      Navigation: {
        enable: true,
        type: 'Native',
        //Enable panning events only if we're dragging the empty
        //canvas (and not a node).
        panning: 'avoid nodes',
        zooming: 40 //zoom speed. higher is more sensible
      },
      // Change node and edge styles such as
      // color and width.
      // These properties are also set per node
      // with dollar prefixed data-properties in the
      // JSON structure.
      Node: {
        overridable: true,
        dim: 7
      },
      Edge: {
        overridable: true,
        color: '#23A4FF',
        lineWidth: 1
      },
      // Add node events
      Events: {
        enable: true,
        enableForEdges: true,
        type: 'Native',
        onClick: (nodeOrEdge, eventInfo, e) => {
          console.log(nodeOrEdge)
          console.log(eventInfo)
          console.log(e)
          if (nodeOrEdge === false) {
            // I am in the background
            console.log('I am the background')
          } else {
            if (!nodeOrEdge.nodeFrom) {
              console.log('I am a Node')
            } else {
              console.log('I am an edge')
            }
          }
        },
        //Change cursor style when hovering a node
        onMouseEnter: (node) => {
          if (node.nodeFrom) return;
          fd.canvas.getElement().style.cursor = 'move';
        },
        onMouseLeave: (node) => {
          if (node.nodeFrom) return;
          fd.canvas.getElement().style.cursor = '';
        },
        //Update node positions when dragged
        onDragMove: (node, eventInfo, e) => {
          // Add shift checking to draw new edge
          if (node.nodeFrom) return;
          var pos = eventInfo.getPos();
          node.pos.setc(pos.x, pos.y);
          fd.plot();
        },
        //Implement the same handler for touchscreens
        // onTouchMove: (node, eventInfo, e) => {
        //   if (node.nodeFrom) return;
        //   $jit.util.event.stop(e); //stop default touchmove event
        //   this.onDragMove(node, eventInfo, e);
        // }
      },
      //Number of iterations for the FD algorithm
      iterations: 200,
      //Edge length
      levelDistance: 130,
      // This method is only triggered
      // on label creation and only for DOM labels (not native canvas ones).
      onCreateLabel: (domElement, node) => {
        // Create a 'name' and 'close' buttons and add them
        // to the main node label
        var nameContainer = document.createElement('span'),
          closeButton = document.createElement('span'),
          style = nameContainer.style;
        nameContainer.className = 'name';
        nameContainer.innerHTML = node.name;
        closeButton.className = 'close';
        closeButton.innerHTML = 'x';
        domElement.appendChild(nameContainer);
        domElement.appendChild(closeButton);
        style.fontSize = "0.8em";
        style.color = "black";

        //Fade the node and its connections when
        //clicking the close button
        closeButton.onclick = () => {
          node.setData('alpha', 0, 'end');
          node.eachAdjacency(function (adj) {
            adj.setData('alpha', 0, 'end');
          });
          fd.fx.animate({
            modes: ['node-property:alpha',
              'edge-property:alpha'],
            duration: 500
          });
        };
        //Toggle a node selection when clicking
        //its name. This is done by animating some
        //node styles like its dimension and the color
        //and lineWidth of its adjacencies.
        nameContainer.onclick = (thing) => {
          //set final styles
          fd.graph.eachNode(function (n) {
            if (n.id != node.id) delete n.selected;
            n.setData('dim', 7, 'end');
            n.eachAdjacency(function (adj) {
              adj.setDataset('end', {
                lineWidth: 0.4,
                color: '#23a4ff'
              });
            });
          });
          if (!node.selected) {
            node.selected = true;
            node.setData('dim', 17, 'end');
            node.eachAdjacency(function (adj) {
              adj.setDataset('end', {
                lineWidth: 3,
                color: '#36acfb'
              });
            });
          } else {
            delete node.selected;
          }
          //trigger animation to final styles
          fd.fx.animate({
            modes: ['node-property:dim',
              'edge-property:lineWidth:color'],
            duration: 500
          });
          // Build the right column relations list.
          // This is done by traversing the clicked node connections.
          var html = "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",
            list = [];
          node.eachAdjacency(function (adj) {
            if (adj.getData('alpha')) list.push(adj.nodeTo.name);
          });
          //append connections information
          // $jit.id('inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";
        };
      },
      // Change node styles when DOM labels are placed
      // or moved.
      onPlaceLabel: function (domElement, node) {
        var style = domElement.style;
        var left = parseInt(style.left);
        var top = parseInt(style.top);
        var w = domElement.offsetWidth;
        style.left = (left - w / 2) + 'px';
        style.top = (top + 10) + 'px';
        style.display = '';
      }
    });


    // load JSON data.
    fd.loadJSON(this.json);
    // compute positions incrementally and animate.
    fd.computeIncremental({
      iter: 40,
      property: 'end',
      onStep: function (perc) {
      },
      onComplete: () => {

        fd.animate({
          modes: ['linear'],
          transition: $jit.Trans.Elastic.easeOut,
          duration: 2500
        });
      }
    });

    this.fd = fd;
    // this.fd.graph.removeNode('graphnode0');
  }

  ngAfterViewInit() {


  }

  addNode() {
    console.log('add node');
    this.fd.graph.addNode({ id: "added", name: "addedNode", data: { "$color": "#557EAA", type: "olol"} })
    this.fd.graph.plot();
  }

  openAgentPanel() {
    this.agentCanal.passIn(new IssacAgent());
  }

  addAgent(agent: IssacAgent) {
    this.fd.graph.addNode({ id: agent.uri, name: agent.label, data: { "$color": "#557EAA", type: "agent", id: agent.uri, name: agent.label} })
  }

  getData() {
    // console.log(this.json);
    // console.log(this.fd.graph.getData());
    this.fd.graph.each(function (node) {
      console.log(node);
    });

  }

}
