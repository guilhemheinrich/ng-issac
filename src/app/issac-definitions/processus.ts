import { Uri, Litteral, SparqlClass, GraphDefinition, SubPatternType, Collection, SparqlObject } from 'src/app/sparql-parser.service';
import { IssacAgent } from './agent';
import { IssacContext } from './context';
import { Agent } from 'src/app/authentification/user';

export interface IIssacProcessus {
    uri?: string;
    label?: string;
    description?: string;
    owners?: Agent[];
    agents?: IssacAgent[];
    contexts?: IssacContext[];
}

export class IssacProcessus extends SparqlClass {
    @Uri()
    uri: string;

    @Litteral()
    label?: string;

    @Litteral()
    description?: string;

    @Collection()
    @SparqlObject(Agent)
    owners?: Agent[];

    @Collection()
    @SparqlObject(IssacAgent)
    agents?: IssacAgent[];

    @SparqlObject(IssacContext)
    @Collection()
    contexts?: IssacContext[];

    constructor(options?: IIssacProcessus) {
        super();
        if (options) {
            Object.getOwnPropertyNames(options).forEach((propertyName) => {
                this[propertyName] = options[propertyName];
            });
        }
    }

    parseSkeleton(prefix: string = '') {
        var query = new GraphDefinition(
            {
                triplesContent: [
                    `
            ${this.sparqlIdentifier('uri', prefix)} a issac:Processus .\n
            ${this.sparqlIdentifier('uri', prefix)} rdfs:label ${this.sparqlIdentifier('label', prefix)} .\n
            OPTIONAL { ${this.sparqlIdentifier('uri', prefix)} skos:definition ${this.sparqlIdentifier('description', prefix)} } .\n
            `
                ]
            });

        let emptyUser = new Agent();
        query.triplesContent.push(
            `${this.sparqlIdentifier('uri', prefix)} admin:hasWriteAccess ${emptyUser.sparqlIdentifier('uri', this.sparqlIdentifier('owners', prefix))} .\n`
        );
        let userPattern = emptyUser.parseSkeleton(this.sparqlIdentifier('owners', prefix));
        query.merge(userPattern);

        let emptyContext = new IssacContext();
        let contextPattern = new GraphDefinition({
            triplesContent: [
                `
            ${this.sparqlIdentifier('uri', prefix)} issac:hasContext
            `
            ]
        });
        contextPattern.merge(emptyContext.parseSkeleton(this.sparqlIdentifier('contexts', prefix)));
        query.subPatterns.push([contextPattern, SubPatternType.OPTIONAL]);

        let emptyAgent = new IssacAgent();
        let agentPattern = new GraphDefinition({
            triplesContent: [
                `
            ${this.sparqlIdentifier('uri', prefix)} issac:involve
            `
            ]
        });
        agentPattern.merge(emptyAgent.parseSkeleton(this.sparqlIdentifier('agents', prefix)));
        query.subPatterns.push([agentPattern, SubPatternType.OPTIONAL]);

        return query;
    }

    parseIdentity(): GraphDefinition {
        var query = new GraphDefinition({
            triplesContent: [
                `
            <${this.uri}> a issac:Processus .\n
            <${this.uri}> rdfs:label \"${this.label}\"^^xsd:string .\n
            <${this.uri}> skos:definition \"${this.description}\"^^xsd:string .\n
            `
            ]
        });
        this.owners.forEach((owner) => {
            query.triplesContent.push(
                `<${this.uri}> admin:hasWriteAccess <${owner.uri}> .\n`
            );
        });

        this.agents.forEach((agent) => {
            query.triplesContent.push(
                `
            <${this.uri}> issac:involve <${agent.uri}>
            `
            );
            query.merge(agent.parseIdentity());
        });

        this.contexts.forEach((context) => {
            query.triplesContent.push(
                `
            <${this.uri}> issac:hasContext <${context.uri}>
            `
            );
            query.merge(context.parseIdentity());
        });
        return query;
    }
}
