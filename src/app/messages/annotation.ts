
import { UniqueIdentifier, GlobalVariables, uuidv4, dateToxsdTimestamp } from '../configuration';
import { Prefix, SparqlClass, Uri, Litteral, SparqlObject, Collection, GraphDefinition, SubPatternType, SparqlType } from '../sparql-parser.service';
import { Agent } from "src/app/authentification/user";



interface ISparqlAnnotation {
    uri?: string;
    target: string;
    bodyValue?: string;
    creator?: Agent;
    motivation?: string;
    created?: string;

}

export class SparqlAnnotation extends SparqlClass {
    @Uri()
    uri: string;

    @Uri()
    target: string = "";

    @Litteral()
    bodyValue: string = "";

    @SparqlObject(Agent)
    creator: Agent = new Agent();

    @Uri()
    motivation: string = "";

    @Litteral()
    created: string = "";

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.oa,
        GlobalVariables.ONTOLOGY_PREFIX.dcterms
    ]

    static readonly gatheringVariables = ['bodyContent'];

    constructor(options?: ISparqlAnnotation) {
        super();
        if (options) {
            Object.getOwnPropertyNames(options).forEach((propertyName) => {
                this[propertyName] = options[propertyName];
            });
        }
        this.generateUri();

    }
    parseSkeleton(prefix: string = '') {
        console.log(this.creator.parseSkeleton(this.sparqlIdentifier('creator', prefix)));
        let emptyUser = new Agent();
        var query = new GraphDefinition(
            {
                triplesContent: [
                    `
            ${this.sparqlIdentifier('uri', prefix)} rdf:type oa:Annotation .
            ${this.sparqlIdentifier('uri', prefix)} oa:motivatedBy ${this.sparqlIdentifier('motivation', prefix)} .
            ${this.sparqlIdentifier('uri', prefix)} oa:bodyValue ${this.sparqlIdentifier('bodyValue', prefix)} .
            ${this.sparqlIdentifier('uri', prefix)} dcterms:created ${this.sparqlIdentifier('created', prefix)} .
            ${this.sparqlIdentifier('uri', prefix)} oa:hasTarget ${this.sparqlIdentifier('target', prefix)} .\n
            `
                ]
            });
        query.triplesContent.push(
            `${this.sparqlIdentifier('uri', prefix)} dcterms:creator ${emptyUser.sparqlIdentifier('uri', this.sparqlIdentifier('creator', prefix))} .\n`
        );
        let userPattern = emptyUser.parseSkeleton(this.sparqlIdentifier('creator', prefix));
        query.merge(userPattern);
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

    generateUri() {
        if (this.uri !== undefined && this.uri !== '') return;
        this.uri = GlobalVariables.ONTOLOGY_PREFIX.prefix_message.uri + uuidv4()
    }


    parseIdentity() {
        var query = new GraphDefinition({
            triplesContent: [
                `
                <${this.uri}> rdf:type oa:Annotation .
                <${this.uri}> oa:motivatedBy <${this.motivation}> .
                <${this.uri}> oa:bodyValue '''${this.bodyValue}''' .
                <${this.uri}> dcterms:created "${this.created}"^^xsd:dateTimeStamp
                .
                <${this.uri}> oa:hasTarget <${this.target}> .
                <${this.uri}> dcterms:creator <${this.creator.uri}>
                `
            ]
        });

        return query;
    }
}