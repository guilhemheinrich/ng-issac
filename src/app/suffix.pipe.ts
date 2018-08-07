import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'suffix'
})
export class SuffixPipe implements PipeTransform {

  transform(stringableArray: Array<{ toString(): string; }>, suffix:string): string[] {
    return stringableArray.map((stringableElement) => {return stringableElement + suffix});
  }

}
