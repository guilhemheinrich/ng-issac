import { UniqueIdentifier } from '../configuration';

export class ThesaurusEntry {
    id: UniqueIdentifier
    synonyms?: string[];
    parent: UniqueIdentifier;
    childs: UniqueIdentifier[] = <UniqueIdentifier[]>[];
    siblings: UniqueIdentifier[] = <UniqueIdentifier[]>[];
    description? :string;

    constructor(IThesaurusEntry? :ThesaurusEntryInterface) {
        if (IThesaurusEntry) {
            this.id             = IThesaurusEntry.id         ;
            this.synonyms       = IThesaurusEntry.synonyms   ;
            this.childs         = IThesaurusEntry.childs     ;
            this.siblings       = IThesaurusEntry.siblings   ;
            this.parent         = IThesaurusEntry.parent     ;
            this.description    = IThesaurusEntry.description;
        }
    }
}

export interface ThesaurusEntryInterface {
    id: UniqueIdentifier;
    synonyms?: string[];
    parent?: UniqueIdentifier;
    childs?: UniqueIdentifier[];
    siblings?: UniqueIdentifier[];
    description? :string;
}



