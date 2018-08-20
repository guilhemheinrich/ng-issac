import { UniqueIdentifier, GlobalVariables } from '../configuration';
import { Prefix, SparqlClass, Uri, Litteral, SparqlObject, Collection, GraphDefinition, SubPatternType, SparqlType } from '../sparql-parser.service';

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
        let gatheringVariables = ['uri', 'name'];
        let subselect = gatheringVariables.map((value) => {
            return this.sparqlIdentifier(value);
        }).join(' ');
        gatheringVariables.forEach((attribute) => {
            let gathering = new GraphDefinition();
            gathering.triplesContent.push(`
            SELECT ${subselect} WHERE {
                ${graphPattern.triplesContent.join(' ')}
                FILTER regex(STR(${this.sparqlIdentifier(attribute)}), '${search}', 'i')
            }
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

    parseRestricter(attribute: keyof SkosIdentifier, values: string[], prefix?: string): GraphDefinition {
        var restriction = new GraphDefinition(
            {
                triplesContent: [`VALUES (${this.sparqlIdentifier(attribute.toString(), prefix)}) { \n`]
            });
        switch (this._sparqlAttributes[attribute].type) {
            case SparqlType.IRI:
                values.forEach((value) => {
                    restriction.triplesContent[0] += ` ( <${value}> ) \n`;

                })
                break;
            case SparqlType.LITTERAL:
                values.forEach((value) => {
                    restriction.triplesContent[0] += ` ( "${value}" ) \n`;

                })
                break;
        }
        restriction.triplesContent[0] += ` }`;
        return restriction;
    }
}
export class ThesaurusEntry extends SparqlClass{
    @SparqlObject(SkosIdentifier)
    id: SkosIdentifier = new SkosIdentifier();
    @Litteral()
    @Collection()
    synonyms?: string[];
    @SparqlObject(SkosIdentifier)
    @Collection()
    parents: SkosIdentifier[] = <SkosIdentifier[]>[];
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
            this.parents         = IThesaurusEntry.parents     ;
            this.description    = IThesaurusEntry.description;
        }
    }

    parseRestricter(attribute: keyof ThesaurusEntry, values: string[], prefix? : string): GraphDefinition {
        var restriction = new GraphDefinition(
            {
                triplesContent: [`VALUES (${this.sparqlIdentifier(attribute.toString(), prefix)}) { \n`]
            });
        switch (this._sparqlAttributes[attribute].type) {
            case SparqlType.IRI:
                values.forEach((value) => {
                    restriction.triplesContent[0] += ` ( <${value}> ) \n`;

                })
                break;
            case SparqlType.LITTERAL:
                values.forEach((value) => {
                    restriction.triplesContent[0] += ` ( "${value}" ) \n`;

                })
                break;
        }
        restriction.triplesContent[0] += ` }`;
        return restriction;
    }

    parseSkeleton(prefix: string = '') {
        var query = new GraphDefinition();

        let emptySkosIdentifier = new SkosIdentifier();
        query.merge(emptySkosIdentifier.parseSkeleton(this.sparqlIdentifier('id')));

        // Children part
        let childspattern = emptySkosIdentifier.parseSkeleton(this.sparqlIdentifier('childs'));
        childspattern.triplesContent.push(
            `${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('childs'))} skos:broader ${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('id'))} .`
        );
        query.subPatterns.push([childspattern, SubPatternType.OPTIONAL]);

        // Parent part
        let parentpattern = emptySkosIdentifier.parseSkeleton(this.sparqlIdentifier('parents'));
        parentpattern.triplesContent.push(
            `${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('parents'))} skos:narrower ${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('id'))} .`
        );

            // Siblings pattern
            let siblingspattern = emptySkosIdentifier.parseSkeleton(this.sparqlIdentifier('siblings'));
            siblingspattern.triplesContent.push(
                `${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('siblings'))} skos:broader ${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('parents'))} .`
            );
            parentpattern.subPatterns.push([siblingspattern, SubPatternType.OPTIONAL]);

        query.subPatterns.push([parentpattern, SubPatternType.OPTIONAL]);

        query.triplesContent.push(
            `OPTIONAL {
                ${emptySkosIdentifier.sparqlIdentifier('uri', this.sparqlIdentifier('id'))} skos:altLabel ${this.sparqlIdentifier('synonyms')} .\n
            }`
        );
        
        return query;
    }
}

export interface ThesaurusEntryInterface {
    id: SkosIdentifier;
    synonyms?: string[];
    parents?: SkosIdentifier[];
    childs?: SkosIdentifier[];
    siblings?: SkosIdentifier[];
    description? :string;
}

/*
Used to add an inheritance restriction on an element based on a skos ontology 
*/
export function addRootRestriction(childrenIdentifier: string, rootUris: string[] = ['http://lod.nal.usda.gov/nalt/12729'])
{
    let rootRestriction = `
    ?root skos:narrower* ${childrenIdentifier} .
    VALUES ?root {
            ${rootUris.map((uri)=>
            {
                return '<' + uri +'>';
            }).join(' ')}
        }
    `;
    let graphRestriction = new GraphDefinition({
        triplesContent: [rootRestriction],
        prefixes: [
            GlobalVariables.ONTOLOGY_PREFIX.skos
        ]
    })
    return graphRestriction;
}

/*
Find top level node of an element of a skos ontology 
*/
export function findRoots(childrenIdentifier: string)
{
    let rootRestriction = `
    ?root skos:narrower* <${childrenIdentifier}> .
    FILTER NOT EXISTS {?god skos:narrower ?root}
    `;
    let graphRestriction = new GraphDefinition({
        triplesContent: [rootRestriction],
        prefixes: [
            GlobalVariables.ONTOLOGY_PREFIX.skos
        ]
    })
    return graphRestriction;
}

export function findAllRoots(): string
{
    let allRootsQuery = `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
    SELECT distinct ?firstBorn ?label WHERE {
    ?firstBorn skos:narrower ?child .
    ?firstBorn skos:prefLabel ?label .
    FILTER NOT EXISTS {?god skos:narrower ?firstBorn}
    FILTER  (lang(?label) = 'en')
    }
    `;
    return allRootsQuery;
}



