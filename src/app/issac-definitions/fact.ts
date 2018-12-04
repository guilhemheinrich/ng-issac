import { Uri, Litteral, SparqlClass, GraphDefinition, SubPatternType, SparqlObject, Collection } from 'src/app/sparql-parser.service';
import { IssacAgent } from './agent';
import { IssacContext } from './context';

export class SparqlFact extends SparqlClass{
    @Uri()
    uri: string;

    @SparqlObject(IssacAgent)
    agent: IssacAgent;

    @SparqlObject(IssacContext)
    context: IssacContext;

    /*
        Here we don't know yet : 
        Should the fact be between a litteral list,
        or another resource (class) ?
    */

}