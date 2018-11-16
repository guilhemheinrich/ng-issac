import {Settable, settable} from './Settable'
import {SkosNode} from './SkosNode'
import {APRelationship} from './APRelationship'

// @Settable    
export class Agent extends SkosNode {
    @settable
    relationships: APRelationship[];

    constructor(options?: {}) {
        super(options);
    }
}