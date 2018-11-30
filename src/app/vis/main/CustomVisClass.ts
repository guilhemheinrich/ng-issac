// Custom nodes
import { Agent } from 'src/app/models/Agent';
import { Processus } from 'src/app/models/Processus';
import { APRelationship } from 'src/app/models/APRelationship';

import {Node, Edge, DataSet} from 'vis';

export interface issacNode extends Node {
    data: Agent|Processus
}

export interface issacEdge extends Edge {
    data: APRelationship
}

export function getData(from: DataSet<issacEdge | issacNode>, uri: string) {
    let nodeOrEdge = from.get().filter((item)=> {
        return item.data.uri === uri;
    })
    if (nodeOrEdge.length > 0) {
        return nodeOrEdge[0];
    } else {
        return null
    }

}
