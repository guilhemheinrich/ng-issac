import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'propertyAccess'
})
export class PropertyAccessPipe implements PipeTransform {

  transform(value: any, propertyName: string): any {
    return value.map((object) => {return object[propertyName]});
  }

}
