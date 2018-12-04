import { Uri, Litteral, SparqlClass, GraphDefinition, SubPatternType, Collection, SparqlObject, Prefix, SparqlType } from 'src/app/sparql-parser.service';
import { GlobalVariables } from '../configuration';

export interface IIssacRelationship {
    uri?: string;
    subject: SparqlClass;
    object: SparqlClass;
    proprieties?: {};
}


export class IssacRelationship extends SparqlClass {
    @Uri()
    uri: string;

    subject: SparqlClass;
    object: SparqlClass;

    proprieties: {};

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
        GlobalVariables.ONTOLOGY_PREFIX.rdfs
    ]

    constructor(options?: IIssacRelationship) {
        super(options);
    }

    parseGather(search: string, graphPattern: GraphDefinition): GraphDefinition {
        var gather = new GraphDefinition();
        return gather;
    }

    parseSkeleton(prefix: string = '') {
        var query = new GraphDefinition();
        return query;
    }

    parseIdentity(): GraphDefinition {
        var query = new GraphDefinition();
        return query;
    }

    parseFilter(prefix?: string):GraphDefinition {
        let filter = new GraphDefinition();
        return filter;
      }
}