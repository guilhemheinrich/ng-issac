import {Settable, settable} from './Settable'
import {UriBased} from './UriBased'
import {Processus} from './Processus'
import {SkosNode} from './SkosNode'

// @Settable
export class APRelationship extends UriBased{
    @settable
    link: [Processus, SkosNode] | [SkosNode, Processus];
    @settable
    processusToAgentImpact: 'positive' | 'none' | 'unknown' | 'negative';

}




