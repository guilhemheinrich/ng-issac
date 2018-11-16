
import {Settable, settable, SettableC} from './Settable'
import { hash32 } from 'src/app/configuration';


export class UriBased extends SettableC{
    @settable
    uri: string;

    constructor(options?: {}) {
        super(options);
        if (this.uri === undefined) {
            this.uri = this.generateUri(); 
        }
    }

    generateUri() {
        return this.constructor.name + '#' + hash32(Math.random().toString() + Date.now().toString()).toString();
    }
}

