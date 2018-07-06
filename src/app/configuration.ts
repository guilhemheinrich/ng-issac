import { Prefix } from './sparql-parser.service';

export const GlobalVariables = Object.freeze({
    // Database relative informations
    TRIPLESTORE : {
            'dsn' : 'http://147.99.7.61:8890/sparql',
        },
    ONTOLOGY_PREFIX : {
        // Prefix
        // 'issac' : 'http://www.semanticweb.org/heinrich/ontologies/ECPP#', 
        // 'rdfs'  : 'http://www.w3.org/2000/01/rdf-schema#',
        // 'skos'  : 'http://www.w3.org/2004/02/skos/core#',
        // 'foaf'  : 'http://xmlns.com/foaf/0.1/',
        // 'admin' : 'http://www.semanticweb.org/heinrich/ontologies/2018/administration',
        'issac' : {prefix : 'issac', uri : 'http://www.semanticweb.org/heinrich/ontologies/ECPP#' },
        'rdfs'  : {prefix : 'rdfs',  uri : 'http://www.w3.org/2000/01/rdf-schema#' },
        'skos'  : {prefix : 'skos',  uri : 'http://www.w3.org/2004/02/skos/core#' },
        'foaf'  : {prefix : 'foaf',  uri : 'http://xmlns.com/foaf/0.1/' },
        'admin' : {prefix : 'admin', uri : 'http://www.semanticweb.org/heinrich/ontologies/2018/administration' },

        // Context and nomination
        // 'context_processus_added' : 'http://ECPP_models/processus/added',
        // 'prefix_processus' : 'http://ECPP_models/process/',
        // 'prefix_action' : 'http://ECPP_models/action/',
        // 'context_administration' : 'http://ECPP_administration/agent/set/',''
        // 'prefix_agent' : 'http://ECPP_administration/agent/id/',
        'context_processus_added'   : {prefix : 'context_processus_added', uri : 'http://ECPP_models/processus/added' },
        'prefix_processus'          : {prefix : 'prefix_processus'       , uri : 'http://ECPP_models/process/' },
        'prefix_action'             : {prefix : 'prefix_action'          , uri : 'http://ECPP_models/action/' },
        'context_administration'    : {prefix : 'context_administration' , uri : 'http://ECPP_administration/agent/set/' },
        'prefix_agent'              : {prefix : 'prefix_agent'           , uri : 'http://ECPP_administration/agent/id/' },
    }
});

export function hash32(stringToEncode : string)
{
	let  hash = 0;
	if (stringToEncode.length == 0) return hash;
	for (let i = 0; i < stringToEncode.length; i++) {
		let char = stringToEncode.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}
