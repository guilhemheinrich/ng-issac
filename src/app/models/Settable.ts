export function settable(target: any, key: string) {
    console.log(target)
    console.log(key)
    let source;
    if (target.prototype) {
        // target is the constructor function : propriety is a static member
        source = target.prototype
    } else {
        // target is the prototype of the class : property is static
        source = target
    }

    let proprieties;
    if (Object.getOwnPropertyNames(source).findIndex((value) => value === '__settable') !== -1) {
        proprieties = source.__settable ;
    } else {
        if (source.__settable) {
            proprieties = [...source.__settable];
        } else {
            proprieties =  [];
        }
    }
    proprieties.push(key);
    Object.defineProperty(source, '__settable', {
        value: proprieties,
        writable: true
    })
}


export class SettableC {
    constructor(options = {}) {
        let settableProprieties = (<any>this).__settable;
        settableProprieties.forEach((proprietyKey) => {
            let type = Reflect.getMetadata("design:type", this, proprietyKey).name;

            if (options !== undefined && options[proprietyKey] !== undefined 
                ) {
                    if ( options[proprietyKey].constructor.name === type) {
                        this[proprietyKey] = options[proprietyKey];
                    } else {
                        console.log('There is a type mismatch in ' + this.constructor.name + ' at defining propriety ' + type)
                    }
                }
        }); 
    }
}