import { Injectable } from '@angular/core';
import { isArray } from 'util';
import "reflect-metadata";
import { ProcessusBis } from './processus/processus';
import {GlobalVariables} from './configuration'

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
    this.graph = undefined;
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

export enum SubPatternType {
  UNION = "UNION",
  OPTIONAL = "OPTIONAL",
}
export class GraphDefinition {
  triplesContent: string[] = [''];
  subPatterns: Array<[GraphDefinition, SubPatternType]> = new Array<[GraphDefinition, SubPatternType]>();
  namedGraph?: string;

  constructor(
    triplesContent?: string[],
    namedGraph?: string
  ) {
    this.triplesContent = triplesContent;
    if (namedGraph) {
      this.namedGraph = namedGraph;
    }
  }

  merge(otherGraphDefinition: GraphDefinition) {
    // Doesn't handle multiple named graph, if relevant, yet

    if (otherGraphDefinition.triplesContent) {
      otherGraphDefinition.triplesContent.forEach((triple) => {
        this.triplesContent.push(triple);
      });
    }
    if (otherGraphDefinition.subPatterns) {
      otherGraphDefinition.subPatterns.forEach((graphDefinition) => {
        this.subPatterns.push(graphDefinition);
      });
    }
  }

  toString(): string {
    let out_string = `{ \n`;
    if (this.triplesContent) {
      this.triplesContent.forEach(tripleContent => {
        out_string += tripleContent + ` \n`;
      });
    }
    if (this.subPatterns) {
      this.subPatterns.forEach(graphDefinition => {
        out_string += graphDefinition[1];
        out_string += graphDefinition[0].toString() + ` \n`;
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

export function sparqlComponent(prefix: string) {
  return this.prefix = prefix;
}
const formatMetadataKey = Symbol("format");
function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}

export class SparqlAbstractClass {

  // private readonly _uris: string[] = ['hello'];
  parseSkeletonQuery() {
    let propertiesName = Object.getOwnPropertyNames(this);
    // console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
    // console.log(Object.getOwnPropertyNames(this))
    // console.log(Object.getOwnPropertyNames(this))
    console.log(propertiesName);
    propertiesName.forEach((propertyName) => {
      let propertyDescriptor = Object.getOwnPropertyDescriptor(this, propertyName);
      console.log(propertyDescriptor.value);
      // console.log(propertyDescriptor.value);
      // if (propertyDescriptor.value instanceof SparqlBinding ) {
      //     console.log(propertyDescriptor.value + "is a sparql Attribute");
      //     console.log(propertyDescriptor.value.value);
      //     console.log(propertyDescriptor.value.asRDF());
      //     console.log(propertyDescriptor.value.sparqlValue);
      // }
    })
  }
}

export class SparqlClass {
  // readonly _uris;
  // readonly _litterals;
  readonly _sparqlAttributes;
  constructor() {
    this._sparqlAttributes = Object.getPrototypeOf(this)[sparqlAtrributeName];
  }

  sparqlParse(key: keyof any, type: string, prefix: string = '') {
    // if (prefix) {
    //   console.log(prefix + Object.getPrototypeOf(this).constructor.name);
    // } else {
    //   console.log(Object.getPrototypeOf(this).constructor.name);
    // }
    console.log(key);
    console.log(this);
    console.log(this[key].toString());
    let out:string;
    switch (this._sparqlAttributes[key].type)
    {
      case SparqlType.IRI:
      if (type=="UNK") {
        // if (this[key]==undefined) {
        out = "?" + prefix + "." +this[key] + Object.getPrototypeOf(this).constructor.name;
      }else {
        out = "<" + this[key] + ">";
      }
      break;
      case SparqlType.LITTERAL:
      if (type=="UNK") {
        // if (this[key]==undefined) {
        out = "?" + prefix + "." + this[key] + Object.getPrototypeOf(this).constructor.name;
      }else {
        out = "\"" + this[key] + "\"";
      }
      break;
    }
    return out;
  }

  sparqlIdentifier(key: keyof any, prefix?: string) {
    let out:string;
    let sparqlAttribute = this._sparqlAttributes[key];
    console.log(sparqlAttribute.identifier);
    if (prefix) {
      out = "?" + prefix + sparqlDelimitter + sparqlAttribute.identifier;
    } else {
      out = "?" + sparqlAttribute.identifier;
    }
    return out;
  }
}

export function toSparqlUri(uri: string): string{
  return "<" + uri + ">";
}

export function toSparqlLitteral(litteral: string, suffix: string = '^^xsd:string'): string{
  return "\"" + litteral +  "\"" + suffix;
}

const sparqlAtrributeName = '_sparqlAttributes';
const sparqlDelimitter = '_'
const sparqlUriPorpertyName = '_uris';
export function Uri() {
  return (function (target: Object, propertyKey: string | symbol) {
    if (!target[sparqlAtrributeName]) {
      target[sparqlAtrributeName] = []
    }
    // target[sparqlUriPorpertyName].push(propertyKey);
    target[sparqlAtrributeName][propertyKey] = {
      type: SparqlType.IRI,
      identifier: target.constructor.name + sparqlDelimitter + propertyKey.toString()
    };

  })
}


const sparqlLitteralPorpertyName = '_litterals';
export function Litteral() {
  return (function (target: Object, propertyKey: string | symbol) {
    if (!target[sparqlAtrributeName]) {
      target[sparqlAtrributeName] = []
    }
    // target[sparqlUriPorpertyName].push(propertyKey);
    target[sparqlAtrributeName][propertyKey] = {
      type: SparqlType.LITTERAL,
      identifier: target.constructor.name + sparqlDelimitter + propertyKey.toString()
    };

  })
}

export class SparqlBinding {
  public value: string | string[];
  public sparqlValue: string;
  public type: SparqlType;

  asRDF(): string | string[] {
    let out;
    if (!(this.value instanceof Array)) {
      switch (this.type) {
        case SparqlType.IRI:
          out = "<" + this.value + ">";
          break;
        case SparqlType.LITTERAL:
          out = "\n" + this.value + "\n";
          break;
      }
    } else {
      out = [];
      switch (this.type) {
        case SparqlType.IRI:
          this.value.forEach((value) => {
            out.push("<" + value + ">");
          })
          break;
        case SparqlType.LITTERAL:
          this.value.forEach((value) => {
            out.push("\"" + this.value + "\"");
          })
          break;
      }
    }
    return out;
  }

}

export enum SparqlType {
  IRI = "Iri",
  LITTERAL = "Litteral"
}


