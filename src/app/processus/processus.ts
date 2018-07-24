
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
        action.generateUri();
        saveQuery.triplesContent.push(
            `
            <${this.uri}> issac:hasAction <${action.uri}> .
            `
        );
        saveQuery.merge(action.parseDefinition());
    })
        return saveQuery;
    }


    generateUri() {
        let hashedFingerprint = this.name;
        this.inputs.forEach(input => {
            hashedFingerprint += input.uri;
        });
        this.outputs.forEach(output => {
            hashedFingerprint += output.uri;
        });
        // Add time to avoid a set of possible collision relying purely on processus attributes
        hashedFingerprint += (new Date()).getTime();
        this.uri = GlobalVariables.ONTOLOGY_PREFIX.prefix_processus.uri + hash32(hashedFingerprint)
    }


}


export class Action {

    uri: string;
    agent: UniqueIdentifier;
    roles: string[];

    static readonly types = {
        INPUT : 'Input',
        OUTPUT : 'Output',
        INOUT : 'Inout'
    };
    

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
    ]

    readonly type: string;
    constructor(options?: IAction
    ) {
        if (options) {
            this.uri = options.uri;
            this.agent = options.agent;
            this.roles = options.roles;
        }
        this.type = 'Role';
    };

    parseDefinition()
    {
        if (this.uri === "" || !this.uri) {
            this.generateUri();
        }

        var saveQuery = new GraphDefinition([
            `
            <${this.uri}> issac:hasAgentType <${this.agent.uri}> .\n
            <${this.uri}> issac:hasActionType "${this.type}" .\n
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

    generateUri() {
        let hashedFingerprint = '';
        this.roles.forEach(role => {
            hashedFingerprint += role;
        });
        hashedFingerprint += this.agent.uri;
        this.uri = GlobalVariables.ONTOLOGY_PREFIX.prefix_action.uri + hash32(hashedFingerprint)
    }
}

export interface IAction {
    uri: string;
    agent: UniqueIdentifier;
    roles: string[];

}

export class Input extends Action {
    readonly type: string = Action.types.INPUT;
    roles = ['issac:Input'];
    constructor(
        options?: IAction
    ) {
        super(options);
        this.type = Action.types.INPUT;
    };
}
export class Output extends Action {
    readonly type: string = Action.types.OUTPUT;
    roles = ['issac:Output'];
    constructor(
        options?: IAction
    ) {
        super(options);
        this.type = Action.types.OUTPUT;
    };
}

export class InOut extends Action {
    readonly type: string = Action.types.INOUT;
    roles = ['issac:Output', 'issac:Input'];
    constructor(
        options?: IAction
    ) {
        super(options);
        this.type = Action.types.INOUT;
    };
}
