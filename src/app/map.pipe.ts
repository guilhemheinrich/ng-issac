import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'map'
})
export class MapPipe implements PipeTransform {

  transform<T>(value: Array<T>, cb: (T, index, object) => {} ): any {   
    return value.map(cb);
  }

}
