
import { UniqueIdentifier, hash32, GlobalVariables } from '../configuration';
import { SparqlClientService } from '../sparql-client.service';
import { Prefix, GraphDefinition, QueryType, Uri, Litteral, SparqlClass, SubPatternType, SparqlType, SparqlObject, Collection } from '../sparql-parser.service';
import { isArray } from 'util';
export interface IProcessus {
    uri: string;
    name: string;
    description?: string;
    inputs?: Input[];
    outputs?: Output[]
    owners: string[];
}

export type ProcessusAlias = Processus;
export class Processus extends SparqlClass {
    @Uri()
    uri: string;
    @Litteral()
    name: string;
    @Litteral()
    description?: string;
    @SparqlObject('Input')
    @Collection()
    inputs?: Input[] = new Array<Input>();

    @SparqlObject('Output')
    @Collection()
    outputs?: Output[]= new Array<Output>();
    @Uri()
    @Collection()
    owners: string[];
    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
        GlobalVariables.ONTOLOGY_PREFIX.admin,
        GlobalVariables.ONTOLOGY_PREFIX.rdfs
    ]

    constructor(
        options?: IProcessus,
    ) {
        super();
        if (options) {
            this.uri = options.uri;
            this.name = options.name;
            this.description = options.description;
            this.owners = options.owners;
            this.inputs = new Array<Input>(); 
            this.outputs = new Array<Output>(); 
            options.inputs.forEach((input) => {
                this.inputs.push(new Input(input));
            })
            options.outputs.forEach((output) => {
                this.outputs.push(new Output(output));
            })
        }
    };


    parseGather( search: string): GraphDefinition
    {
        var gather = new GraphDefinition([]);
        ['uri', 'name', 'description'].forEach((attribute) => {
            gather.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${search}', 'i')
            `);
        })
        return gather;
    }

    parseFilter()
    {
        var filter = new GraphDefinition([]);
        ['uri', 'name', 'description'].forEach((attribute) => {
            if (this[attribute] !== undefined && this[attribute] !== '')
            filter.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${this[attribute] }', 'i')
            `);
        })
        return filter;
    }

    parseRestricter(attribute: keyof Processus, values: string[])
    {
        var restriction = new GraphDefinition([`VALUES (${this.sparqlIdentifier(attribute.toString())}) { \n`]);
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

    parseSkeleton(prefix: string = '')
    {
        var query = new GraphDefinition([
            `
            ${this.sparqlIdentifier('uri', prefix)} a issac:Process .\n
            ${this.sparqlIdentifier('uri', prefix)} rdfs:label ${this.sparqlIdentifier('name', prefix)} .\n
            OPTIONAL { ${this.sparqlIdentifier('uri', prefix)} rdfs:label ${this.sparqlIdentifier('description', prefix)} } .\n
            `
        ]);
            query.triplesContent.push(
                `${this.sparqlIdentifier('uri', prefix)} admin:hasWriteAccess ${this.sparqlIdentifier('owners', prefix)} .\n`
            );

        let emptyAction = new Action();
        let actionPattern = new GraphDefinition([
            `
            ${this.sparqlIdentifier('uri', prefix)} issac:hasAction
            `
        ])
        actionPattern.merge(emptyAction.parseSkeleton('Processus'));
        query.subPatterns.push([actionPattern, SubPatternType.OPTIONAL]);
        return query;
    }


    parseIdentity(): GraphDefinition {
        var query = new GraphDefinition([
            `
            <${this.uri}> a issac:Process .\n
            <${this.uri}> rdfs:label \"${this.name}\"^^xsd:string .\n
            
            `
        ]);
        this.owners.forEach((owner) => {
            query.triplesContent.push(
                `<${this.uri}> admin:hasWriteAccess <${owner}> .\n`
            );
        });
        let actions = (<Array<Action>>this.inputs).concat(<Array<Action>>this.outputs);
        actions.forEach((action) => 
    {
        // action.generateUri();
        query.triplesContent.push(
            `
            <${this.uri}> issac:hasAction 
            `
        );
        query.merge(action.parseIdentity());
    })
        return query;
    }

    operationDelete()
    {
        var operation = new GraphDefinition([
            `?s ?p ?o .
            ?o ?p1 ?o1
            `
        ]);
        let whereClause = new GraphDefinition([
            `
                ?s ?p ?o .
                OPTIONAL {
                    ?o ?p1 ?o1 .
                    FILTER (isBlank(?o))
                } .
                VALUES ( ?s ) { (<${this.uri}>) }
            `
        ]) 
        
        return {quadPattern : operation, graphPattern: whereClause};
    }

    generateUri() {
        if (this.uri !== undefined && this.uri !== '') return;
        let hashedFingerprint = this.name;
        this.inputs.forEach(input => {
            hashedFingerprint += input.agent.uri;
        });
        this.outputs.forEach(output => {
            hashedFingerprint += output.agent.uri;
        });
        // Add time to avoid a set of possible collision relying purely on processus attributes
        hashedFingerprint += (new Date()).getTime();
        this.uri = GlobalVariables.ONTOLOGY_PREFIX.prefix_processus.uri + hash32(hashedFingerprint)
    }


}

export enum ActionType {
    INPUT = "Input",
    OUTPUT = "Output",
    INOUT = "Both"
}
export class Action extends SparqlClass {

    agent: UniqueIdentifier;

    agentLabel: string;
    @Uri()
    agentUri: string;

    roles: string[];


    

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
    ]
    @Uri()
    type: ActionType;
    constructor(options?: IAction
    ) {
        super();
        this.agent = new UniqueIdentifier;
        if (options) {
            if (options.agent) {
                this.agentUri = options.agent.uri;
                this.agentLabel = options.agent.name;
            }
            // this.uri = options.uri;
            this.agent = options.agent;
            this.roles = options.roles;
            this.type = options.type;
            this.agentUri = options.agentUri;
            this.agentLabel = options.agentLabel;
        }
    };

    parseIdentity(): GraphDefinition
    {

        var query = new GraphDefinition([
            `
            [
                issac:hasAgentType <${this.agent.uri}> ;\n
                issac:hasActionType "${this.type}" ;\n
            ] .
            `
        ]);
        return query;
    }

    parseSkeleton(prefix :string = ''): GraphDefinition
    {
        var query = new GraphDefinition([
            `
            [
                issac:hasAgentType ${this.sparqlIdentifier('agentUri', prefix)} ;\n
                issac:hasActionType ${this.sparqlIdentifier('types', prefix)} ;\n
            ] .
            `
        ]);
        return query;
    }

    parseGather( search: string): GraphDefinition
    {
        var gather = new GraphDefinition([]);
        ['agentLabel', 'agentUri'].forEach((attribute) => {
            gather.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${search}', 'i')
            `);
        })
        return gather;
    }

    parseFilter()
    {
        var filter = new GraphDefinition([]);
        ['agentLabel', 'agentUri'].forEach((attribute) => {
            if (this[attribute] !== undefined && this[attribute] !== '')
            filter.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${this[attribute] }', 'i')
            `);
        })
        return filter;
    }

}

export interface IAction {
    // uri?: string;
    agent?: UniqueIdentifier;
    agentUri:string;
    agentLabel:string;
    roles?: string[];
    type?: ActionType;
}

export class Input extends Action {
    type: ActionType = ActionType.INPUT;
    roles = ['issac:Input'];
    constructor(
        options?: IAction
    ) {
        super(options);
        this.type = ActionType.INPUT;
    };
}
export class Output extends Action {
    type: ActionType = ActionType.OUTPUT;
    roles = ['issac:Output'];
    constructor(
        options?: IAction
    ) {
        super(options);
        this.type = ActionType.OUTPUT;
    };
}

export class InOut extends Action {
    type: ActionType = ActionType.INOUT;
    roles = ['issac:Output', 'issac:Input'];
    constructor(
        options?: IAction
    ) {
        super(options);
        this.type = ActionType.INOUT;
    };
}
