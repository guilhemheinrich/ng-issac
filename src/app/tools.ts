import { Pipe, PipeTransform } from '@angular/core';
import * as _ from "lodash";
import { isArray } from 'util';
@Pipe({name: 'selectField'})
export class selectFieldPipe implements PipeTransform {
    objectValue: Object;
    objectPattern: Object;
    output: string;

    transform(value: Object | Array<any>, jsonRecipe: Object, delimitter: string|string[] = ","): string {
        this.objectValue = value;
        this.output = "";
        this.objectPattern = jsonRecipe;
        this._processDepth();
        return this.output;
  }

  _processDepth(propertyPath?:string[])
  {
    let currentPatternSlice;
    let currentObjectSlice;
    let currentPropertyPath;
    
      if (propertyPath !== undefined ) {
        currentPropertyPath = propertyPath;
        currentPatternSlice = _.get(this.objectPattern, propertyPath);
        currentObjectSlice = _.get(this.objectValue, propertyPath);
      } else 
      {
        currentPropertyPath = [];
        currentPatternSlice = this.objectPattern;
        currentObjectSlice = this.objectValue;
      }
    let propertyNames = Object.getOwnPropertyNames(currentPatternSlice);
    propertyNames.forEach((propertyName) => {
        if (typeof currentPatternSlice[propertyName] == "string") {
            // We expect the corresponding object field to be an array
            currentObjectSlice[propertyName].forEach((property) => {
                this.output += this.parseExpression(property);
            })
        } else {
            let nextPropertyPath = currentPropertyPath;
            nextPropertyPath.push(propertyName);
            this._processDepth(nextPropertyPath);
        }
    })
  }



  parseExpression(propertyPath:string[])
  {
    let contentExpression = _.get(this.objectPattern, propertyPath);
    contentExpression.replace('{{value}}', _.get(this.objectValue, propertyPath))
  }


}

function isPrimitive(test) {
    return (test !== Object(test));
};

function pathArrayToProperty (path: string[], object: Object)
{
    path.reduce((accumulator, currentValue) => {
        return object[currentValue];
    });
}