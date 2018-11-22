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
    processusToAgentImpact: Processus_Agent_Impact = Processus_Agent_Impact.Unknown;

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

export enum Processus_Agent_Impact {
    Positive = 1,
    None = 0,
    Negative = -1,
    Unknown = undefined,
}




