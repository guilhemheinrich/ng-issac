// Custom nodes
import { Agent } from 'src/app/models/Agent';
import { Processus } from 'src/app/models/Processus';
import { APRelationship } from 'src/app/models/APRelationship';

import {Node, Edge} from 'vis';

export interface issacNode extends Node {
    data: Agent|Processus
}

export interface issacEdge extends Edge {
    data: APRelationship
}
