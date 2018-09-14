import { Uri, Litteral, SparqlClass, GraphDefinition, SubPatternType, Prefix } from 'src/app/sparql-parser.service';
import { GlobalVariables } from '../configuration';


export interface IIssacLocation {
    uri?: string;
    label?: string;
}

export class IssacLocation extends SparqlClass {
    @Uri()
    uri: string;

    @Litteral()
    label: string;

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
        GlobalVariables.ONTOLOGY_PREFIX.rdfs
    ]

    constructor(options?: IssacLocation) {
        super(options);
    }

    parseGather(search: string, graphPattern: GraphDefinition): GraphDefinition {
        var gather = new GraphDefinition();
        // We don't do anything if search is empty or undefined
        if (search === undefined || search == '') return graphPattern;
        gather.subPatterns.push([new GraphDefinition(), SubPatternType.EMPTY]);
        ['label'].forEach((attribute) => {
            let gathering = new GraphDefinition(JSON.parse(JSON.stringify(graphPattern)));
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
            ${this.sparqlIdentifier('uri', prefix)} a issac:Location .\n
            ${this.sparqlIdentifier('uri', prefix)} rdfs:label ${this.sparqlIdentifier('label', prefix)} .\n

            `
                ]
            });
        return query;
    }

    parseIdentity(): GraphDefinition {
        var query = new GraphDefinition({
            triplesContent: [
            `
            <${this.uri}> a issac:Location .\n
            <${this.uri}> rdfs:label \"${this.label}\"^^xsd:string .\n
            `
            ]
        });
        return query;
    }
}