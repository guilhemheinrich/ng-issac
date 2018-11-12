import { Component, OnInit } from '@angular/core';
import { Canal } from 'src/app/communication';
import { IssacProcessus } from 'src/app/issac-definitions/processus';
declare let $jit: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  processusCanal = new Canal<IssacProcessus>();

  public fd;
  
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
      "adjacencies": [
        {
          "nodeTo": "graphnode1",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode3",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode2",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode4",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode10",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode6",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode11",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode12",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode13",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode14",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode15",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode16",
          "nodeFrom": "graphnode0",
          "data": {}
        },
        {
          "nodeTo": "graphnode17",
          "nodeFrom": "graphnode0",
          "data": {}
        }
      ],
      "data": {
        "$color": "#83548B",
        "$type": "circle"
      },
      "id": "graphnode0",
      "name": "graphnode0"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode2",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode3",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode4",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode5",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode6",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode7",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode8",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode9",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode10",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode11",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode12",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode13",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode14",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode15",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode16",
          "nodeFrom": "graphnode1",
          "data": {}
        },
        {
          "nodeTo": "graphnode17",
          "nodeFrom": "graphnode1",
          "data": {}
        }
      ],
      "data": {
        "$color": "#83548B",
        "$type": "star"
      },
      "id": "graphnode1",
      "name": "graphnode1"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode3",
          "nodeFrom": "graphnode2",
          "data": {}
        },
        {
          "nodeTo": "graphnode5",
          "nodeFrom": "graphnode2",
          "data": {}
        },
        {
          "nodeTo": "graphnode9",
          "nodeFrom": "graphnode2",
          "data": {}
        },
        {
          "nodeTo": "graphnode18",
          "nodeFrom": "graphnode2",
          "data": {}
        }
      ],
      "data": {
        "$color": "#EBB056",
        "$type": "circle"
      },
      "id": "graphnode2",
      "name": "graphnode2"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode5",
          "nodeFrom": "graphnode3",
          "data": {}
        },
        {
          "nodeTo": "graphnode9",
          "nodeFrom": "graphnode3",
          "data": {}
        },
        {
          "nodeTo": "graphnode10",
          "nodeFrom": "graphnode3",
          "data": {}
        },
        {
          "nodeTo": "graphnode6",
          "nodeFrom": "graphnode3",
          "data": {}
        },
        {
          "nodeTo": "graphnode11",
          "nodeFrom": "graphnode3",
          "data": {}
        },
        {
          "nodeTo": "graphnode12",
          "nodeFrom": "graphnode3",
          "data": {}
        }
      ],
      "data": {
        "$color": "#70A35E",
        "$type": "triangle"
      },
      "id": "graphnode3",
      "name": "graphnode3"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#70A35E",
        "$type": "star"
      },
      "id": "graphnode4",
      "name": "graphnode4"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode9",
          "nodeFrom": "graphnode5",
          "data": {}
        }
      ],
      "data": {
        "$color": "#416D9C",
        "$type": "star"
      },
      "id": "graphnode5",
      "name": "graphnode5"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode10",
          "nodeFrom": "graphnode6",
          "data": {}
        },
        {
          "nodeTo": "graphnode11",
          "nodeFrom": "graphnode6",
          "data": {}
        }
      ],
      "data": {
        "$color": "#416D9C",
        "$type": "star"
      },
      "id": "graphnode6",
      "name": "graphnode6"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#416D9C",
        "$type": "triangle"
      },
      "id": "graphnode7",
      "name": "graphnode7"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#EBB056",
        "$type": "star"
      },
      "id": "graphnode8",
      "name": "graphnode8"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#70A35E",
        "$type": "triangle"
      },
      "id": "graphnode9",
      "name": "graphnode9"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode11",
          "nodeFrom": "graphnode10",
          "data": {}
        }
      ],
      "data": {
        "$color": "#83548B",
        "$type": "triangle"
      },
      "id": "graphnode10",
      "name": "graphnode10"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#416D9C",
        "$type": "triangle"
      },
      "id": "graphnode11",
      "name": "graphnode11"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#70A35E",
        "$type": "square"
      },
      "id": "graphnode12",
      "name": "graphnode12"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode14",
          "nodeFrom": "graphnode13",
          "data": {}
        }
      ],
      "data": {
        "$color": "#416D9C",
        "$type": "square"
      },
      "id": "graphnode13",
      "name": "graphnode13"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#70A35E",
        "$type": "square"
      },
      "id": "graphnode14",
      "name": "graphnode14"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode16",
          "nodeFrom": "graphnode15",
          "data": {}
        },
        {
          "nodeTo": "graphnode17",
          "nodeFrom": "graphnode15",
          "data": {}
        }
      ],
      "data": {
        "$color": "#C74243",
        "$type": "circle"
      },
      "id": "graphnode15",
      "name": "graphnode15"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode17",
          "nodeFrom": "graphnode16",
          "data": {}
        }
      ],
      "data": {
        "$color": "#EBB056",
        "$type": "circle"
      },
      "id": "graphnode16",
      "name": "graphnode16"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#83548B",
        "$type": "triangle"
      },
      "id": "graphnode17",
      "name": "graphnode17"
    },
    {
      "adjacencies": [
        {
          "nodeTo": "graphnode19",
          "nodeFrom": "graphnode18",
          "data": {}
        },
        {
          "nodeTo": "graphnode20",
          "nodeFrom": "graphnode18",
          "data": {}
        }
      ],
      "data": {
        "$color": "#C74243",
        "$type": "circle"
      },
      "id": "graphnode18",
      "name": "graphnode18"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#EBB056",
        "$type": "star"
      },
      "id": "graphnode19",
      "name": "graphnode19"
    },
    {
      "adjacencies": [],
      "data": {
        "$color": "#416D9C",
        "$type": "circle"
      },
      "id": "graphnode20",
      "name": "graphnode20"
    }
  ];


  ngOnInit() {
  
    this.processusCanal.flowIn$.subscribe((obj) => {
      if (!obj) return;
      console.log(obj.data.label);
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
          console.log (nodeOrEdge)
          console.log (eventInfo)
          console.log (e)
          if (nodeOrEdge === false) {
            // I am in the background
            console.log ('I am the background')           
          } else {
            if (!nodeOrEdge.nodeFrom ) {
              console.log ('I am a Node')
            } else {
              console.log ('I am an edge')
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
    onComplete:  () => {

      fd.animate({
        modes: ['linear'],
        transition: $jit.Trans.Elastic.easeOut,
        duration: 2500
      });
    }
  });

  this.fd = fd;
  }

  ngAfterViewInit() {

   
  }

  addNode() {
    this.fd.graph.addNode({ id: "added", name: "addedNode", data: { "$color": "#557EAA"} })
  }

}
