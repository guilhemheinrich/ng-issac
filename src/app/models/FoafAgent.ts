import {Settable, settable} from './Settable'
import {UriBased} from './UriBased'


// @Settable
export class FoafAgent extends UriBased {
    @settable
    firstname: string = 'george';
    @settable
    lastname: string;
    @settable
    email: string;

}