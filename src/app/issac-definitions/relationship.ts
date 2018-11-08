import { Uri, Litteral, SparqlClass, GraphDefinition, SubPatternType, Collection, SparqlObject, Prefix, SparqlType } from 'src/app/sparql-parser.service';


export interface IIssacRelationship {
    subject: SparqlClass;
    object: SparqlClass;
}