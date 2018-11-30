import { Injectable } from '@angular/core';
import { isArray } from 'util';
import "reflect-metadata";
import { GlobalVariables } from './configuration'
import * as ts from "typescript";
import { hash32 } from 'src/app/configuration';


export enum QueryType {
  ASK = "ASK",
  QUERY = "SELECT",
  UPDATE = "UPDATE",
  ADD = "INSERT",
  DELETE = "DELETE",

}
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
    if (this.queryType === QueryType.ADD || this.queryType === QueryType.DELETE || this.queryType === QueryType.ASK) {
      if (this.graphDefinition !== undefined) {

        request += ` ${this.graphDefinition.toString()}`;
      } else {
        request += ' { } ';
      }
    }
    if (this.graphPattern) {
      request += `WHERE \n`;
      request += ` ${this.graphPattern.toString()}`;
    }
    if (this.order) {
      request += 'ORDER BY ' + this.order;
    }
    return request;
  }

}


const sparqlAtrributeName = '_sparqlAttributes';
const sparqlIdName = '_sparqlKey';
const sparqlDelimitter = '_'

export class SparqlAttribute {
  type: SparqlType;
  isCollection: boolean;
  identifier: string;
  attributeName: string;
  sparqlObject: SparqlClass;
  constructor() {
    this.isCollection = false;
  }
}

export function _sparqlAttributeSetup(target: Object, propertyKey: string | symbol) {
  if (target[sparqlAtrributeName] === undefined) {
    target[sparqlAtrributeName] = {};
  }
  if (target[sparqlAtrributeName][propertyKey] === undefined) {
    target[sparqlAtrributeName][propertyKey] = new SparqlAttribute();
    target[sparqlAtrributeName][propertyKey].identifier = target.constructor.name + sparqlDelimitter + propertyKey.toString();
    target[sparqlAtrributeName][propertyKey].attributeName = propertyKey.toString();
    // target[sparqlAtrributeName].push(propertyKey);
  }
}

export enum SparqlType {
  IRI = "Iri",
  LITTERAL = "Litteral",
  OBJECT = "SparqlObject",
}


export enum SubPatternType {
  UNION = "UNION",
  OPTIONAL = "OPTIONAL",
  WHERE = "WHERE",
  EMPTY = ""
}

export interface IGraphDefinition {
  triplesContent?: string[];
  subPatterns?: Array<[GraphDefinition, SubPatternType]>;
  namedGraph?: string;
  prefixes?: Array<Prefix>;
}
export class GraphDefinition {
  triplesContent: string[];
  subPatterns?: Array<[GraphDefinition, SubPatternType]>;
  namedGraph?: string;
  prefixes?: Array<Prefix>;

  constructor(
    options: IGraphDefinition = {}
  ) {
    if (options.triplesContent === undefined) {
      this.triplesContent = [];
    } else {
      this.triplesContent = options.triplesContent;
    }
    this.subPatterns = new Array<[GraphDefinition, SubPatternType]>();
    if (options.subPatterns !== undefined) {
      options.subPatterns.forEach((pairGraphType) => {
        this.subPatterns.push([new GraphDefinition(JSON.parse(JSON.stringify(pairGraphType[0]))), pairGraphType[1]])
      });

    }
    if (options.namedGraph) {
      this.namedGraph = options.namedGraph;
    }
    if (options.prefixes === undefined) {
      this.prefixes = [];
    } else {
      this.prefixes = options.prefixes;
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

    if (otherGraphDefinition.prefixes) {
      otherGraphDefinition.prefixes.forEach((prefix) => {
        this.prefixes.push(prefix);
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




export class SparqlClass {
  uri: string;

  readonly _sparqlAttributes;
  readonly _sparqlKey;

  /*
  Great care must be taken when calling a super constructor : this not properly initialized before the end of the super constructor
  <https://github.com/Microsoft/TypeScript/issues/8277>
  */
  constructor(options?: Object) {
    this._sparqlAttributes = Object.getPrototypeOf(this)[sparqlAtrributeName];

    (Object.getOwnPropertyNames(this._sparqlAttributes)).forEach((attribute) => {
      // Initialize collection !!
      if (this._sparqlAttributes[attribute].isCollection) {
        this[attribute] = [];
      }

      let hasInitialValue = (options !== undefined) && (options[attribute] !== undefined);


      if (this._sparqlAttributes[attribute].type === SparqlType.OBJECT) {
        if (this._sparqlAttributes[attribute].isCollection) {
          if (hasInitialValue) {
            options[attribute].forEach((object) => {
              let newObject = new this._sparqlAttributes[attribute].sparqlObject.constructor(object);
              if (newObject.uri !== '') {
                this[attribute].push(newObject);
              }
            });
          }
        } else {
          if (hasInitialValue) {
            let newObject = new this._sparqlAttributes[attribute].sparqlObject.constructor(options[attribute]);
            if (newObject.uri !== '') {
              this[attribute] = newObject;
            }

          } else {
            let newObject = new this._sparqlAttributes[attribute].sparqlObject.constructor();
            if (newObject.uri !== '') {
              this[attribute] = newObject;
            }

          }

        }
      } else {
        if (hasInitialValue) {
          this[attribute] = options[attribute];
        }
      }

    });

    // if (options) {
    //   Object.getOwnPropertyNames(options).forEach((propertyName) => {
    //     /* If an incorrect object is passed, this._sparqlAttributes[propertyName] doesn't exist and wreak havoc
    //     */
    //     if (this._sparqlAttributes[propertyName]) {
    //       if (this._sparqlAttributes[propertyName].type === SparqlType.OBJECT) {
    //         if (this._sparqlAttributes[propertyName].isCollection) {
    //           // this[propertyName] = [];
    //           options[propertyName].forEach((object) => {
    //             let newObject = new this._sparqlAttributes[propertyName].sparqlObject.constructor(object);
    //             if (newObject.uri !== '') {
    //               this[propertyName].push(newObject);
    //             }
    //           });
    //         } else {
    //           let newObject = new this._sparqlAttributes[propertyName].sparqlObject.constructor(options[propertyName]);
    //           if (newObject.uri !== '') {
    //             this[propertyName] = newObject;
    //           }
    //         }
    //       } else {
    //         this[propertyName] = options[propertyName];
    //       }
    //     }
    //   });
    // }
  }

  generateUri() {
    if (!this.uri || this.uri === '') {
      this.uri = this.constructor.name + '#' + hash32(Math.random().toString() + Date.now().toString()).toString();
    }
    return this.uri;
  }

  sparqlParse(key: keyof any, type: string, prefix: string = '') {
    let out: string;
    switch (this._sparqlAttributes[key].type) {
      case SparqlType.IRI:
        if (type == "UNK") {
          // if (this[key]==undefined) {
          out = "?" + prefix + "." + this[key] + Object.getPrototypeOf(this).constructor.name;
        } else {
          out = "<" + this[key] + ">";
        }
        break;
      case SparqlType.LITTERAL:
        if (type == "UNK") {
          // if (this[key]==undefined) {
          out = "?" + prefix + "." + this[key] + Object.getPrototypeOf(this).constructor.name;
        } else {
          out = "\"" + this[key] + "\"";
        }
        break;
    }
    return out;
  }
  sparqlIdentifier(key: keyof any, prefix?: string) {
    let out: string;
    let sparqlAttribute = this._sparqlAttributes[key];
    if (prefix) {
      out = "?" + prefix + sparqlDelimitter + sparqlAttribute.identifier;
    } else {
      out = "?" + sparqlAttribute.identifier;
    }
    out = out.replace(/\?+/, "?");
    return out;
  }

  makeBindings() {
    let jsonBindings = `(concat('`;
    jsonBindings += this.processBindings()
    jsonBindings += `') AS ?` + this.constructor.name + ')';
    return jsonBindings;
  }

  processBindings(prefix?: string) {
    let current_prefix: string;
    if (prefix === undefined) {
      current_prefix = Object.getPrototypeOf(this).constructor.name;
    } else {
      current_prefix = prefix;
    }
    let jsonBindings = `{`;
    Object.keys(this._sparqlAttributes).forEach((key) => {
      let sparqlAttribute = this._sparqlAttributes[key];
      // console.log(sparqlAttribute);
      jsonBindings += this._processBindings(sparqlAttribute, current_prefix);
      jsonBindings += `,`;
    })
    jsonBindings = jsonBindings.substring(0, jsonBindings.length - 1);
    jsonBindings += `}`;
    return jsonBindings;
  }

  private _processBindings(sparqlAttribute: SparqlAttribute, prefix: string = '') {
    let jsonBindings = ``;
    jsonBindings += `"${sparqlAttribute.attributeName}":`;
    let identifier = '';
    switch (sparqlAttribute.type) {
      case SparqlType.IRI:
      case SparqlType.LITTERAL:
        identifier = `"',?${prefix + '_' + sparqlAttribute.attributeName},'"`;
        // Should be reworked, as well as the whole thing
        // Quick fix to avoir multiple nested question mark
        // identifier = identifier.replace(/\?+/,"?");

        break;
      case SparqlType.OBJECT:
        let new_prefix = prefix + sparqlDelimitter + sparqlAttribute.attributeName + sparqlDelimitter + sparqlAttribute.sparqlObject.constructor.name;
        identifier = sparqlAttribute.sparqlObject.processBindings(new_prefix);
      // identifier = identifier.replace(/\?+/,"?");



      // let sparqlObject = sparqlAttribute.sparqlObject;
      // let tmpObj:SparqlClass;
      // let code = 'tmpObj = new ' + sparqlObject +'();'
      // let result = ts.transpile(code);
      // eval(code);
      // identifier = tmpObj.processBindings(new_prefix);
      // identifier = window[sparqlObject].prototype.processBindings(new_prefix);
      // Object.create(sparqlObject)
    }
    if (sparqlAttribute.isCollection) {
      jsonBindings += `[',group_concat(distinct concat(' ${identifier} ');separator=','),']`
    } else {
      jsonBindings += `${identifier} `
    }
    jsonBindings += ``;
    return jsonBindings;
  }


}

export function toSparqlUri(uri: string): string {
  return "<" + uri + ">";
}

export function toSparqlLitteral(litteral: string, suffix: string = '^^xsd:string'): string {
  return "\"" + litteral + "\"" + suffix;
}




// Accepting a newable argument as <https://stackoverflow.com/questions/33224047/how-to-specify-any-newable-type-in-typescript>
export function SparqlObject(sparqlType: { new(...args: any[]): any; }) {
  return (function (target: Object, propertyKey: string | symbol) {
    _sparqlAttributeSetup(target, propertyKey);
    target[sparqlAtrributeName][propertyKey].type = SparqlType.OBJECT;

    target[sparqlAtrributeName][propertyKey].sparqlObject = new sparqlType();
  })
}

export function Uri() {
  return (function (target: Object, propertyKey: string | symbol) {
    _sparqlAttributeSetup(target, propertyKey);
    target[sparqlAtrributeName][propertyKey].type = SparqlType.IRI;
  })
}
export function Litteral() {
  return (function (target: Object, propertyKey: string | symbol) {
    _sparqlAttributeSetup(target, propertyKey);
    target[sparqlAtrributeName][propertyKey].type = SparqlType.LITTERAL;
  })
}

export function Collection() {
  return (function (target: Object, propertyKey: string | symbol) {
    _sparqlAttributeSetup(target, propertyKey);
    target[sparqlAtrributeName][propertyKey].isCollection = true;
  })
}

export function SparqlId(target: Object, propertyKey: string | symbol) {
  target[sparqlIdName] = propertyKey;
}








