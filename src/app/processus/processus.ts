
import { UniqueIdentifier, hash32, GlobalVariables } from '../configuration';
import { SparqlClientService } from '../sparql-client.service';
import { Prefix, GraphDefinition, QueryType, Uri, Litteral, SparqlClass, SubPatternType, SparqlType, SparqlObject, Collection } from '../sparql-parser.service';
import { isArray } from 'util';
import { Agent } from '../authentification/user';


export enum ActionType {
    INPUT = "Input",
    OUTPUT = "Output",
    INOUT = "Both"
}
export class Action extends SparqlClass {

    agent: UniqueIdentifier;

    @Litteral()
    agentLabel: string;
    @Uri()
    agentUri: string;

    @Uri()
    type: ActionType;
    roles: string[];




    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
    ]
    constructor(options?: IAction
    ) {
        super();
        this.agent = new UniqueIdentifier;
        if (options) {
            if (options.agent) {
                this.agentUri = options.agent.uri;
                this.agentLabel = options.agent.name;
                this.agent = options.agent;
            } else {
                this.agentUri = options.agentUri;
                this.agentLabel = options.agentLabel;
                this.agent = {uri: this.agentUri, name: this.agentLabel};
            }
            // this.uri = options.uri;
            this.roles = options.roles;
            this.type = options.type;
        }
    };

    parseIdentity(): GraphDefinition {

        var query = new GraphDefinition({
            triplesContent: [
                `
            [
                issac:hasAgentType <${this.agent.uri}> ;\n
                issac:hasAgentLabel "${this.agent.name}" ;\n
                issac:hasActionType "${this.type}" ;\n
            ] .
            `
            ]
        });
        return query;
    }

    parseSkeleton(prefix: string = ''): GraphDefinition {
        var query = new GraphDefinition({
            triplesContent: [
                `
            [
                issac:hasAgentType ${this.sparqlIdentifier('agentUri', prefix)} ;\n
                issac:hasActionType ${this.sparqlIdentifier('type', prefix)} ;\n
                issac:hasAgentLabel ${this.sparqlIdentifier('agentLabel', prefix)} ;\n
            ] .
            `
            ]
        });
        return query;
    }

    parseGather(search: string): GraphDefinition {
        var gather = new GraphDefinition({});
        ['agentLabel', 'agentUri'].forEach((attribute) => {
            gather.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${search}', 'i')
            `);
        })
        return gather;
    }

    parseFilter() {
        var filter = new GraphDefinition({});
        ['agentLabel', 'agentUri'].forEach((attribute) => {
            if (this[attribute] !== undefined && this[attribute] !== '')
                filter.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${this[attribute]}', 'i')
            `);
        })
        return filter;
    }

}

export interface IAction {
    // uri?: string;
    agent?: UniqueIdentifier;
    agentUri?: string;
    agentLabel: string;
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

export interface IProcessus {
    uri: string;
    name: string;
    description?: string;
    actions?: Action[];
    inputs?: Input[];
    outputs?: Output[]
    owners: Agent[];
}


export class Processus extends SparqlClass {
    @Uri()
    uri: string;
    @Litteral()
    name: string;
    @Litteral()
    description?: string;
    @SparqlObject(Action)
    @Collection()
    actions?: Action[] = new Array<Action>();


    inputs?: Input[] = new Array<Input>();
    outputs?: Output[] = new Array<Output>();

    @SparqlObject(Agent)
    @Collection()
    owners: Agent[];
    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
        GlobalVariables.ONTOLOGY_PREFIX.admin,
        GlobalVariables.ONTOLOGY_PREFIX.rdfs
    ]

    constructor(
        options?: IProcessus,
    ) {
        super();
        this.owners = new Array<Agent>();
        this.actions = new Array<Action>();
        this.inputs = new Array<Input>();
        this.outputs = new Array<Output>();
        if (options) {
            this.uri = options.uri;
            this.name = options.name;
            this.description = options.description;

            if (options.owners !== undefined) {
                options.owners.forEach((owner) => {
                    this.owners.push(new Agent(owner));
                });
            }
            if (options.inputs !== undefined) {
                options.inputs.forEach((input) => {
                    this.inputs.push(new Input(input));
                });
            }
            if (options.outputs !== undefined) {
                options.outputs.forEach((output) => {
                    this.outputs.push(new Output(output));
                });
            }
            if (options.actions !== undefined) {
                options.actions.forEach((input) => {
                    this.actions.push(new Action(input));
                })
            }
        }
    };


    parseGather(search: string, graphPattern: GraphDefinition): GraphDefinition {
        var gather = new GraphDefinition();
        // We don't do anything if search is empty or undefined
        if (search === undefined || search == '') return graphPattern;
        gather.subPatterns.push([new GraphDefinition(), SubPatternType.EMPTY]);
        ['uri', 'name', 'description'].forEach((attribute) => {
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

    parseFilter():GraphDefinition {
        var filter = new GraphDefinition();
        ['uri', 'name', 'description'].forEach((attribute) => {
            if (this[attribute] !== undefined && this[attribute] !== '')
                filter.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${this[attribute]}', 'i')
            `);
        });
        // Here owners is an Array
        // Should handle array and object
        ['owners', 'actions'].forEach((attribute) => {
            if (this[attribute] !== undefined && this[attribute].constructor === Array && this[attribute].length > 0) {
                filter.merge(this[attribute][0].parseFilter('Processus'));
            }
        });
        return filter;
    }

    parseRestricter(attribute: keyof Processus, values: string[]) {
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

    parseSkeleton(prefix: string = '') {
        var query = new GraphDefinition(
            {
                triplesContent: [
                    `
            ${this.sparqlIdentifier('uri', prefix)} a issac:Process .\n
            ${this.sparqlIdentifier('uri', prefix)} rdfs:label ${this.sparqlIdentifier('name', prefix)} .\n
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
        let emptyAction = new Action();
        let actionPattern = new GraphDefinition({
            triplesContent: [
                `
            ${this.sparqlIdentifier('uri', prefix)} issac:hasAction
            `
            ]
        });
        actionPattern.merge(emptyAction.parseSkeleton(this.sparqlIdentifier('actions', prefix)));
        query.subPatterns.push([actionPattern, SubPatternType.OPTIONAL]);
        return query;
    }


    parseIdentity(): GraphDefinition {
        var query = new GraphDefinition({
            triplesContent: [
                `
            <${this.uri}> a issac:Process .\n
            <${this.uri}> rdfs:label \"${this.name}\"^^xsd:string .\n
            <${this.uri}> skos:definition \"${this.description}\"^^xsd:string .\n
            `
            ]
        });
        this.owners.forEach((owner) => {
            query.triplesContent.push(
                `<${this.uri}> admin:hasWriteAccess <${owner.uri}> .\n`
            );
        });
        let actions = (<Array<Action>>this.inputs).concat(<Array<Action>>this.outputs).concat(<Array<Action>>this.actions);
        actions.forEach((action) => {
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
                    FILTER (isBlank(?o))
                } .
                VALUES ( ?s ) { (<${this.uri}>) }
            `
            ]
        });

        return { quadPattern: operation, graphPattern: whereClause };
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

    generateInputsOutputsFromActions() {
        // reset input and output field
        this.inputs = new Array<Input>();
        this.outputs = new Array<Output>();
        this.actions.forEach((action) => {
            switch (action.type) {
                case ActionType.INPUT:
                    this.inputs.push(action);
                    break;
                case ActionType.OUTPUT:
                    this.outputs.push(action);
                    break;
                case ActionType.INOUT:
                    this.inputs.push(action);
                    this.outputs.push(action);
                    break;
            }
        })
    }

}
