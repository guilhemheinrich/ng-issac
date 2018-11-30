import { settable} from './Settable'
import {UriBased} from './UriBased'


// @Settable
export class FoafAgent extends UriBased {
    @settable
    firstname: string;
    @settable
    lastname: string;
    @settable
    email: string;

}