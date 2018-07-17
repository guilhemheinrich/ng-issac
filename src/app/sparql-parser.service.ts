import { Injectable } from '@angular/core';
import { isArray } from 'util';

@Injectable({
  providedIn: 'root'
})
export class SparqlParserService {
  prefixes: Prefix[];
  graph: string;
  queryType = QueryType.QUERY;
  select = [" * "];
  graphDefinition: GraphDefinition;
  graphPattern: GraphDefinition;
  limit: number;
  order: string;

  constructor() { }

  clear(): void {
    this.prefixes = undefined;
    this.graph= undefined;
    this.queryType = QueryType.QUERY;
    this.select = [" * "];
    this.graphDefinition = undefined;
    this.graphPattern = undefined;
    this.limit = undefined;
    this.order = undefined;
  }

  toString(): string {
    let request = "";
    if (this.prefixes) {
      this.prefixes.forEach(prefix => {
        request += `PREFIX ${prefix.prefix}: <${prefix.uri}> \n`;
      });
    }
    if (this.graph) {
      request += `WITH <${this.graph}> \n`
    }
    request += `${this.queryType} `;
    if (this.queryType === QueryType.QUERY) {
      if (this.select) {
        this.select.forEach(select => {
          request += ` ${select} `;
        });
      }
    }
    if (this.queryType === QueryType.ADD || this.queryType === QueryType.DELETE || this.queryType === QueryType.ASK && this.graphDefinition) {
      request += ` ${this.graphDefinition.toString()}`;
    }
    if (this.graphPattern) {
      request += `WHERE \n`;
      request += ` ${this.graphPattern.toString()}`;
    }

    return request;
  }

}

export enum QueryType {
  ASK = "ASK",
  QUERY = "SELECT",
  UPDATE = "UPDATE",
  ADD = "INSERT",
  DELETE = "DELETE"
}

export class GraphDefinition {
  triplesContent: string[];
  graphDefinitions?: GraphDefinition[];
  namedGraph?: string;

  constructor(
    triplesContent: string[],
    graphDefinitions?: GraphDefinition[],
    namedGraph?: string
  ) {
    this.triplesContent = triplesContent;
    if (graphDefinitions) {
      this.graphDefinitions = graphDefinitions;
    }
    if (namedGraph) {
      this.namedGraph = namedGraph;
    }
  }

  toString(): string {
    let out_string = `{ \n`;
    if (this.triplesContent) {
      this.triplesContent.forEach(tripleContent => {
        out_string += tripleContent + ` \n`;
      });
    }
    if (this.graphDefinitions) {
      this.graphDefinitions.forEach(graphDefinition => {
        out_string += 'UNION ';
        out_string += graphDefinition.toString() + ` \n`;
      });
    }
    out_string += ` }`;
    return out_string;
  }
}

export interface Prefix {
  prefix: string;
  uri: string;
}

// export class Prefix {
//   prefix: string;
//   uri:string;

//   constructor() {}
// }

