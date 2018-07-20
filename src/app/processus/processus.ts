
import {UniqueIdentifier} from '../configuration';

export class Processus {
    uri: string;
    name: string;
    description?: string;
    inputs?: Input[];
    outputs?: Output[]
    owner: string[];
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
    constructor(
        options?: IAction
    ){
        super(options);

    };
}
export class Output extends Action {
    static readonly root:string  = 'Output';
    constructor(
        options?: IAction
    ){
        super(options);

    };
}