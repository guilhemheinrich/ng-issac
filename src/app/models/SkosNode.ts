
import { settable} from './Settable'
import {UriBased} from './UriBased'

// @Settable
export class SkosNode extends UriBased {

    @settable
    prefLabel: string;
    @settable
    altLabels: string[];
    @settable
    parents: SkosNode[] | string[];
    @settable
    childs: SkosNode[] | string[];

    constructor(options?: {}) {
        super(options);
    }

}