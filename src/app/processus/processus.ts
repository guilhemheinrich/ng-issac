
import {UniqueIdentifier} from '../configuration';

export interface IProcessus
{
    uri: string;
    name: string;
    description?: string;
    inputs?: Input[];
    outputs?: Output[]
    owner: string[];
}
export class Processus {
    uri: string;
    name: string;
    description?: string;
    inputs?: Input[] = Array<Input>();
    outputs?: Output[] = Array<Output>();
    owner: string[] = [""];

    constructor(options?: IProcessus
    ) {
        if (options) {
            this.uri            = options.uri  ;
            this.name           = options.name  ;
            this.description    = options.description  ;
            this.inputs         = options.inputs  ;
            this.outputs        = options.outputs  ;
            this.owner          = options.owner;
        }

 };
}


export class Action {

    uri: string;
    agent: UniqueIdentifier;
    roles: string[];

    static readonly root: string = 'Role';
    constructor(options?: IAction
       ) {
           if (options) {
               this.uri       = options.uri  ;
               this.agent     = options.agent;
               this.roles     = options.roles;
           }

    };
}

export interface IAction {
    uri: string;
    agent: UniqueIdentifier;
    roles: string[];

}

export class Input extends Action {
    static readonly root: string  = 'Input';
    roles = ['issac:Input'];
    constructor(
        options?: IAction
    ){
        super(options);

    };
}
export class Output extends Action {
    static readonly root:string  = 'Output';
    roles = ['issac:Output'];
    constructor(
        options?: IAction
    ){
        super(options);

    };
}