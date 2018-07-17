export class ThesaurusEntry {
    id: uniqueIdentifier
    synonyms?: string[];
    parent: uniqueIdentifier;
    childs: uniqueIdentifier[] = <uniqueIdentifier[]>[];
    siblings: uniqueIdentifier[] = <uniqueIdentifier[]>[];
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

    // pushIfNotExist(attribute: string, value: uniqueIdentifier) {
    //         console.log(this)
    //         console.log(this[attribute]);
    //         console.log(value);
    //         if (!(<uniqueIdentifier[]>this[attribute]).includes(value)) {
    //         //     // this[attribute].push(value);
    //         }
    // }
}

export interface ThesaurusEntryInterface {
    id: uniqueIdentifier;
    synonyms?: string[];
    parent?: uniqueIdentifier;
    childs?: uniqueIdentifier[];
    siblings?: uniqueIdentifier[];
    description? :string;
}

export class uniqueIdentifier {
    uri: string;
    name: string;
}

