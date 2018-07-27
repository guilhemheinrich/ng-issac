
import { UniqueIdentifier, hash32, GlobalVariables } from '../configuration';
import { SparqlClientService } from '../sparql-client.service';
import { Prefix, GraphDefinition, QueryType } from '../sparql-parser.service';
export interface IProcessus {
    uri: string;
    name: string;
    description?: string;
    inputs?: Input[];
    outputs?: Output[]
    owners: string[];
}
export class Processus {
    uri: string;
    name: string;
    description?: string;
    inputs?: Input[] = Array<Input>();
    outputs?: Output[] = Array<Output>();
    owners: string[] = [""];
    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
        GlobalVariables.ONTOLOGY_PREFIX.admin,
        GlobalVariables.ONTOLOGY_PREFIX.rdfs
    ]

    constructor(
        options?: IProcessus,
    ) {
        if (options) {
            this.uri = options.uri;
            this.name = options.name;
            this.description = options.description;
            this.inputs = options.inputs;
            this.outputs = options.outputs;
            this.owners = options.owners;
        }
        // this.sparqlClient.sparqlEndpoint = GlobalVariables.TRIPLESTORE.dsn;
    };

    parseDefinition(): GraphDefinition {
        if (this.uri === "" || !this.uri) {
            this.generateUri();
        }

        var saveQuery = new GraphDefinition([
            `
            <${this.uri}> a issac:Process .\n
            <${this.uri}> rdfs:label \"${this.name}\"^^xsd:string .\n
            `
        ]);
        this.owners.forEach((owner) => {
            saveQuery.triplesContent.push(
                `<${this.uri}> admin:hasWriteAccess <${owner}> .\n`
            );
        });
        let actions = (<Array<Action>>this.inputs).concat(<Array<Action>>this.outputs);
        actions.forEach((action) => 
    {
        // action.generateUri();
        saveQuery.triplesContent.push(
            `
            <${this.uri}> issac:hasAction 
            `
        );
        saveQuery.merge(action.parseDefinition());
    })
        return saveQuery;
    }


    generateUri() {
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
export class Action {

    // uri: string;
    agent: UniqueIdentifier;
    roles: string[];

    

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
    ]

    type: ActionType;
    constructor(options?: IAction
    ) {
        this.agent = new UniqueIdentifier;
        if (options) {
            // this.uri = options.uri;
            this.agent = options.agent;
            this.roles = options.roles;
            this.type = options.type;
        }
        // this.type = 'Role';
    };

    parseDefinition()
    {
        // if (this.uri === "" || !this.uri) {
        //     this.generateUri();
        // }

        var saveQuery = new GraphDefinition([
            `
            [
                issac:hasAgentType <${this.agent.uri}> .\n
                issac:hasActionType "${this.type}" .\n
            ]
            `
        ]);
        // this.roles.forEach(role => {
        //     saveQuery.triplesContent.push(
        //         `
        //         <${this.uri}> issac:hasRole "${role}"
        //         `
        //     );
        // });
        return saveQuery;
    }

    // generateUri() {
    //     let hashedFingerprint = '';
    //     this.roles.forEach(role => {
    //         hashedFingerprint += role;
    //     });
    //     hashedFingerprint += this.agent.uri;
    //     this.uri = GlobalVariables.ONTOLOGY_PREFIX.prefix_action.uri + hash32(hashedFingerprint)
    // }
}

export interface IAction {
    // uri?: string;
    agent?: UniqueIdentifier;
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
