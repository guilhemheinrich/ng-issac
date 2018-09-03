
import { UniqueIdentifier, GlobalVariables } from '../configuration';
import { Prefix, SparqlClass, Uri, Litteral, SparqlObject, Collection, GraphDefinition, SubPatternType, SparqlType } from '../sparql-parser.service';
import {Agent} from "src/app/authentification/user";


export class SparqlAnnotation extends SparqlClass{
    @Uri()
    uri: string = "";

    @SparqlObject(SparqlClass)
    target: SparqlClass;

    @Litteral()
    bodyValue: string = "";

    @SparqlObject(Agent)
    creator: Agent;

    @Uri()
    motivation: string;

    @Litteral()
    created: string = "";
    
    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.skos,
        GlobalVariables.ONTOLOGY_PREFIX.oa
    ]

    static readonly gatheringVariables = [ 'bodyContent'];


    parseSkeleton(prefix: string = '') {
        var query = new GraphDefinition(
            {
                triplesContent: [
                    `
            ${this.sparqlIdentifier('uri', prefix)} rdf:type oa:Annotation .
            ${this.sparqlIdentifier('uri', prefix)} oa:motivatedBy ${this.sparqlIdentifier('motivation', prefix)} .
            ${this.sparqlIdentifier('uri', prefix)} oa:bodyValue ${this.sparqlIdentifier('bodyValue', prefix)} .
            ${this.sparqlIdentifier('uri', prefix)} dcterms:creator ${this.creator.parseSkeleton(this.sparqlIdentifier('creator', prefix))} .
            ${this.sparqlIdentifier('uri', prefix)} dcterms:created ${this.sparqlIdentifier('created', prefix)} .
            ${this.sparqlIdentifier('uri', prefix)} oa:hasTarget ${this.target.sparqlIdentifier('uri', this.sparqlIdentifier('target', prefix))} .\n
            `
                ]
            });
        return query;
    }

    parseRestricter(attribute: keyof SparqlAnnotation, values: string[], prefix?: string): GraphDefinition {
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