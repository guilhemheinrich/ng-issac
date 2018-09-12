import { Uri, Litteral, SparqlClass, GraphDefinition, SubPatternType, Collection, SparqlObject, Prefix, SparqlType } from 'src/app/sparql-parser.service';
import { IssacAgent } from './agent';
import { IssacContext } from './context';
import { Agent } from 'src/app/authentification/user';
import { GlobalVariables } from '../configuration';

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

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
        GlobalVariables.ONTOLOGY_PREFIX.admin,
        GlobalVariables.ONTOLOGY_PREFIX.rdfs
    ]

    constructor(options?: IIssacProcessus) {
        super(options);
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
            ${this.sparqlIdentifier('uri', prefix)} issac:hasContext ${emptyContext.sparqlIdentifier('uri', this.sparqlIdentifier('contexts', prefix))} .
            `
            ]
        });
        contextPattern.merge(emptyContext.parseSkeleton(this.sparqlIdentifier('contexts', prefix)));
        query.subPatterns.push([contextPattern, SubPatternType.OPTIONAL]);

        let emptyAgent = new IssacAgent();
        let agentPattern = new GraphDefinition({
            triplesContent: [
                `
            ${this.sparqlIdentifier('uri', prefix)} issac:involve ${emptyAgent.sparqlIdentifier('uri', this.sparqlIdentifier('agents', prefix))} .
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
            
            `
            ]
        });
        if (this.description) {
            query.triplesContent.push(`<${this.uri}> skos:definition \"${this.description}\"^^xsd:string .\n `);
        }
        
        this.owners.forEach((owner) => {
            query.triplesContent.push(
                `<${this.uri}> admin:hasWriteAccess <${owner.uri}> .\n`
            );
        });

        this.agents.forEach((agent) => {
            query.triplesContent.push(
                `
            <${this.uri}> issac:involve <${agent.uri}> .
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

    parseGather(search: string, graphPattern: GraphDefinition): GraphDefinition {
        var gather = new GraphDefinition();
        // We don't do anything if search is empty or undefined
        if (search === undefined || search == '') return graphPattern;
        gather.subPatterns.push([new GraphDefinition(), SubPatternType.EMPTY]);
        ['uri', 'label', 'description'].forEach((attribute) => {
            let gathering = new GraphDefinition(JSON.parse(JSON.stringify(graphPattern)));
            // gathering.triplesContent = graphPattern.triplesContent;
            // gathering.subPatterns = graphPattern.subPatterns;
            gathering.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${search}', 'i')
            `);
            gather.subPatterns.push([gathering, SubPatternType.UNION]);
        })
        return gather;
    }

    parseFilter(prefix?: string): GraphDefinition {
        var filter = new GraphDefinition();
        ['uri', 'label', 'description'].forEach((attribute) => {
            if (this[attribute] !== undefined && this[attribute] !== '')
                filter.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute, prefix)}), '${this[attribute]}', 'i')
            `);
        });
        // Here owners is an Array
        // Should handle array and object
        ['owners'].forEach((attribute) => {
            if (this[attribute] !== undefined && this[attribute].constructor === Array && this[attribute].length > 0) {
//                 console.log(this[attribute]);
                filter.merge(this[attribute][0].parseFilter(this.sparqlIdentifier(attribute, prefix)));
            }
        });
        return filter;
    }

    operationDelete() {
        var operation = new GraphDefinition({
            triplesContent: [
                `?s ?p ?o .
                ?o ?p1 ?o1
            `
            ]
        });
        let whereClause = new GraphDefinition({
            triplesContent: [
                `
                ?s ?p ?o .
                OPTIONAL {
                    ?o ?p1 ?o1 .
                } .
                VALUES ( ?s ) { (<${this.uri}>) }
            `
            ]
        });
        return { quadPattern: operation, graphPattern: whereClause };
    }

    parseRestricter(attribute: keyof IssacProcessus, values: string[]) {
        var restriction = new GraphDefinition(
            {
                triplesContent: [`VALUES (${this.sparqlIdentifier(attribute.toString())}) { \n`]
            });
        switch (this._sparqlAttributes[attribute].type) {
            case SparqlType.IRI:
                values.forEach((value) => {
                    restriction.triplesContent[0] += ` ( <${value}> ) \n`;

                })
                break;
            case SparqlType.LITTERAL:
                values.forEach((value) => {
                    restriction.triplesContent[0] += ` ( "${value}" ) \n`;

                })
                break;
        }
        restriction.triplesContent[0] += ` }`;
        return restriction;
    }

    purgeAgents() 
    {
        let alreadyExistingUri = [];
        let purgedAgents = [];
        this.agents.forEach((agent) => {
            if (agent.uri && !alreadyExistingUri.includes(agent.uri)) {
                alreadyExistingUri.push(agent.uri);
                purgedAgents.push(new IssacAgent(agent));
            }
        });
        this.agents = purgedAgents;
    }

}
