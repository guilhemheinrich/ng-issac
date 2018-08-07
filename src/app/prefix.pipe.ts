import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prefix'
})
export class PrefixPipe implements PipeTransform {

  transform(stringableArray: Array<{ toString(): string; }>, prefix:string): string[] {
    return stringableArray.map((stringableElement) => {return prefix + stringableElement});
  }

}
