
import {GlobalVariables} from '../configuration';

export class Processus {
    uri: string;
    name: string;
    description?: string;
    inputs?: Input[];
    outputs?: Output[]
    owner: string[];
}


export class Action {

    public uri: string;
    public agentUri: string;
    public agentLabel: string;
    public roles: string[];

    static readonly root: string = 'issac:Role';
    constructor(options: IAction
       ) {
        this.uri          = options.uri         ;
        this.agentUri     = options.agentUri    ;
        this.agentLabel   = options.agentLabel  ;
        this.roles        = options.roles       ;

    };
}

export interface IAction {
    uri: string;
    agentUri: string;
    agentLabel: string;
    roles: string[];

}

export class Input extends Action {
    static readonly root: string  = 'issac:Input';
    constructor(
        options: IAction
    ){
        super(options);

    };
}
export class Output extends Action {
    static readonly root:string  = 'issac:Output';
    constructor(
        options: IAction
    ){
        super(options);

    };
}