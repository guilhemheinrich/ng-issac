import {Settable, settable} from './Settable'
import {UriBased} from './UriBased'
import {SkosNode} from './SkosNode'
import {APRelationship} from './APRelationship'
import {Agent} from './Agent'
import {FoafAgent} from './FoafAgent'

// @Settable
export class Processus extends UriBased {

    @settable
    label: string = 'hello';
    @settable
    slots: SkosNode[];
    @settable
    relationships: APRelationship[]
    @settable
    description: string;
    @settable
    owner: FoafAgent;

    constructor(options?: {}) {
        super(options);
    }

}