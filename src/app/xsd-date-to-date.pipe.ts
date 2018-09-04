import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'xsdDateToDate'
})
export class XsdDateToDatePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute:'numeric' };
    let date = new Date(value);
    return date.toLocaleDateString("fr", options);
  }

}
