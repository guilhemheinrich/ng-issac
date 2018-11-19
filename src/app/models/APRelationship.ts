import { settable } from './Settable'
import { UriBased } from './UriBased'
import { Processus } from './Processus'
import { Agent } from './Agent'

// @Settable
export class APRelationship extends UriBased {
    // @settable
    // readonly link: [Processus, SkosNode] | [SkosNode, Processus];
    @settable
    agent: Agent;
    @settable
    processus: Processus;
    @settable
    processusToAgentImpact: 'positive' | 'none' | 'unknown' | 'negative' = 'unknown';

    constructor(options = {}) {
        super(options);
        this.uri = this.generateUri();
    }

    generateUri() {
        if (this.agent && this.processus) {
            return this.processus.uri + '_' + this.agent.uri;
        } else {
            return super.generateUri()
        }
    }

}




