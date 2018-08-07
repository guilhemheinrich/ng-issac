import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'concatenate'
})
export class ConcatenatePipe implements PipeTransform {

  transform(stringableArray: Array<{ toString(): string; }>, delimitter: string = ", "): string {
    let concatenated_string = stringableArray.map((stringableElement) => {
      let wrapedValue = stringableElement.toString();
      return wrapedValue;
    }).join(delimitter);
    return concatenated_string;
  }
}
