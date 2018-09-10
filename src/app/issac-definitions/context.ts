import { Uri, Litteral, SparqlClass, GraphDefinition, SubPatternType, SparqlObject, Collection } from 'src/app/sparql-parser.service';
import { IssacAgent } from './agent';
import { IssacLocation } from './location';



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

    constructor(options?: ISparqlContext) {
        super();
        if (options) {
            Object.getOwnPropertyNames(options).forEach((propertyName) => {
                this[propertyName] = options[propertyName];
            });
        }
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