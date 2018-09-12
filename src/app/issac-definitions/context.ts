import { Uri, Litteral, SparqlClass, GraphDefinition, SparqlType, SparqlObject, Prefix } from 'src/app/sparql-parser.service';
import { IssacAgent } from './agent';
import { IssacLocation } from './location';
import { GlobalVariables } from '../configuration';


export interface ISparqlContext {
    uri?: string;
    primaryPlant: IssacAgent;
    location: IssacLocation;
    // times?: string[];
}

export class IssacContext extends SparqlClass {
    @Uri()
    uri: string;

    @SparqlObject(IssacAgent)
    primaryPlant: IssacAgent;

    @SparqlObject(IssacLocation)
    location: IssacLocation;

    // @Uri()
    // @Collection()
    // times: string[];

    static readonly requiredPrefixes: Prefix[] = [
        GlobalVariables.ONTOLOGY_PREFIX.issac,
        GlobalVariables.ONTOLOGY_PREFIX.rdfs
    ]

    constructor(options?: ISparqlContext) {
        super(options);
        // if (options) {
        //     Object.getOwnPropertyNames(options).forEach((propertyName) => {
        //         if (this._sparqlAttributes[propertyName].type === SparqlType.OBJECT) {
        //             if (this._sparqlAttributes[propertyName].isCollection) {
        //                 this[propertyName] = [];
        //                 options[propertyName].forEach((object) => {
        //                     let newObject = new this._sparqlAttributes[propertyName].sparqlObject.constructor(object);
        //                     if (newObject.uri !== '') {
        //                         this[propertyName].push(newObject);
        //                     }
        //                 })

        //             } else {
        //                 let newObject = new this._sparqlAttributes[propertyName].sparqlObject.constructor(options[propertyName]);
        //                 if (newObject.uri !== '') {
        //                     this[propertyName] = newObject;
        //                 }
        //             }
        //         } else {
        //             this[propertyName] = options[propertyName];
        //         }
        //     });
        // }
    }

    parseSkeleton(prefix: string = '') {
        var query = new GraphDefinition(
            {
                triplesContent: [
                    `
            ${this.sparqlIdentifier('uri', prefix)} a issac:Context .\n

            `
                ]
            });

        let emptyPrimaryPlant = new IssacAgent();
        query.triplesContent.push(
            `${this.sparqlIdentifier('uri', prefix)} issac:hasPrimaryPlant ${emptyPrimaryPlant.sparqlIdentifier('uri', this.sparqlIdentifier('primaryPlant', prefix))} .\n`
        );
        let primaryPlantPattern = emptyPrimaryPlant.parseSkeleton(this.sparqlIdentifier('primaryPlant', prefix));
        query.merge(primaryPlantPattern);

        let emptyLocation = new IssacLocation();
        query.triplesContent.push(
            `${this.sparqlIdentifier('uri', prefix)} issac:takePlace ${emptyPrimaryPlant.sparqlIdentifier('uri', this.sparqlIdentifier('location', prefix))} .\n`
        );
        let locationPattern = emptyLocation.parseSkeleton(this.sparqlIdentifier('location', prefix));
        query.merge(locationPattern);
        return query;
    }

    parseIdentity(): GraphDefinition {
        var query = new GraphDefinition({
            triplesContent: [
                `
            <${this.uri}> a issac:Context .\n
            <${this.uri}> issac:hasPrimaryPlant <${this.primaryPlant.uri}>.\n
            <${this.uri}> issac:takePlace <${this.location.uri}>.\n

            `
            ]
        });
        query.merge(this.primaryPlant.parseIdentity());
        query.merge(this.location.parseIdentity());
        return query;
    }
}