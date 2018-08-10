import { UniqueIdentifier, GlobalVariables } from '../configuration';
import { Prefix, SparqlClass, Uri, Litteral, SparqlObject, Collection, GraphDefinition, SubPatternType } from '../sparql-parser.service';

export class SkosIdentifier extends SparqlClass{
    @Uri()
    uri: string = "";
    @Litteral()
    name: string = "";
    
    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.skos
    ]

    parseGather(search: string, graphPattern: GraphDefinition): GraphDefinition {
        var gather = new GraphDefinition();
        // We don't do anything if search is empty or undefined
        if (search === undefined || search == '') return graphPattern;
        gather.subPatterns.push([new GraphDefinition(), SubPatternType.EMPTY]);
        ['uri', 'name'].forEach((attribute) => {
            let gathering = new GraphDefinition(JSON.parse(JSON.stringify(graphPattern)));
            // gathering.triplesContent = graphPattern.triplesContent;
            // gathering.subPatterns = graphPattern.subPatterns;
            gathering.triplesContent.push(`
            FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${search}', 'i')
            `);
            gather.subPatterns.push([gathering, SubPatternType.UNION]);
        })
        return gather;
    }

    parseSkeleton(prefix: string = '') {
        var query = new GraphDefinition(
            {
                triplesContent: [
                    `
            ${this.sparqlIdentifier('uri', prefix)} skos:prefLabel ${this.sparqlIdentifier('name', prefix)} .\n
            FILTER  (lang(${this.sparqlIdentifier('name', prefix)}) = 'en')
            `
                ]
            });
        return query;
    }
}
export class ThesaurusEntry extends SparqlClass{
    @SparqlObject(SkosIdentifier)
    id: SkosIdentifier
    @Litteral()
    @Collection()
    synonyms?: string[];
    @SparqlObject(SkosIdentifier)
    parent: SkosIdentifier;
    @SparqlObject(SkosIdentifier)
    @Collection()
    childs: SkosIdentifier[] = <SkosIdentifier[]>[];
    @SparqlObject(SkosIdentifier)
    @Collection()
    siblings: SkosIdentifier[] = <SkosIdentifier[]>[];

    description? :string;

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.skos
    ]

    constructor(IThesaurusEntry? :ThesaurusEntryInterface) {
        super();
        if (IThesaurusEntry) {
            this.id             = IThesaurusEntry.id         ;
            this.synonyms       = IThesaurusEntry.synonyms   ;
            this.childs         = IThesaurusEntry.childs     ;
            this.siblings       = IThesaurusEntry.siblings   ;
            this.parent         = IThesaurusEntry.parent     ;
            this.description    = IThesaurusEntry.description;
        }
    }

    parseSkeleton(prefix: string = '') {
        var query = new GraphDefinition();

        let emptySkosIdentifier = new SkosIdentifier();
        query.merge(emptySkosIdentifier.parseSkeleton(this.sparqlIdentifier('id')));

        // Children part
        let childspattern = emptySkosIdentifier.parseSkeleton(this.sparqlIdentifier('childs'));
        childspattern.triplesContent.push(
            `${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('childs'))} skos:narrower ${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('id'))} .`
        );
        query.subPatterns.push([childspattern, SubPatternType.OPTIONAL]);

        // Parent part
        let parentpattern = emptySkosIdentifier.parseSkeleton(this.sparqlIdentifier('parent'));
        parentpattern.triplesContent.push(
            `${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('parent'))} skos:broader ${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('id'))} .`
        );

            // Siblings pattern
            let siblingspattern = emptySkosIdentifier.parseSkeleton(this.sparqlIdentifier('siblings'));
            siblingspattern.triplesContent.push(
                `${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('siblings'))} skos:narrower ${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('parent'))} .`
            );
            parentpattern.subPatterns.push([siblingspattern, SubPatternType.OPTIONAL]);

        query.subPatterns.push([parentpattern, SubPatternType.OPTIONAL]);

        query.triplesContent.push(
            `${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('id'))} skos:altLabel ${this.sparqlIdentifier('synonyms')} .\n`
        );
        
        return query;
    }
}

export interface ThesaurusEntryInterface {
    id: SkosIdentifier;
    synonyms?: string[];
    parent?: SkosIdentifier;
    childs?: SkosIdentifier[];
    siblings?: SkosIdentifier[];
    description? :string;
}




