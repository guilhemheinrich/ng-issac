import { BehaviorSubject } from 'rxjs';

export class Canal<DataType> {
    flowIn$ :BehaviorSubject<{data: DataType, options: Object}> = new BehaviorSubject(null);
    flowOut$ :BehaviorSubject<{data: DataType, options: Object}> = new BehaviorSubject(null);

    passIn(data:DataType, options: Object = {}) {
        this.flowOut$.next({
            data,
            options});
    };

    passOut(data:DataType, options: Object = {}) {
        this.flowIn$.next({
            data,
            options});
    };

}