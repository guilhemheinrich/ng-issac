// export function settable(target: any, key: string) {
//     console.log(target)
//     console.log(key)
//     let proprieties = Reflect.getMetadata('settableProprieties', target) || [];
//     proprieties.push(key);
//     // Reflect.defineMetadata(metadataKey, metadataValue, target);
//     return Reflect.defineMetadata('settableProprieties', proprieties, target);
    
// }

// export function Settable<T extends {new(...args:any[]):{}}>(constructor:T) {
//     // var newConstructor : any  = (options: {} = {}) => {
//     //     // Create the instance
//     //     let instance = new constructor(options);
//     //     let settableProprieties = Reflect.getMetadata( 'settableProprieties', instance);
//     //     console.log(settableProprieties);
//     //     settableProprieties.forEach((proprietyKey) => {
//     //         let type = Reflect.getMetadata("design:type", instance, proprietyKey).name;
//     //         // console.log(options[proprietyKey]);
//     //         // console.log(Object.getPrototypeOf(options[proprietyKey]));

//     //         if (options !== undefined && options[proprietyKey] !== undefined 
//     //             && options[proprietyKey] instanceof Object
//     //             && Object.getPrototypeOf(options[proprietyKey]).constructor.name === type) {
//     //                 instance[proprietyKey] = options[proprietyKey];
//     //             }
//     //     });
//     //     return instance;
//     // }
//     // newConstructor.prototype = constructor.prototype;
//     // return newConstructor;
// }

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
    console.log('I am currently in ' + source.constructor.name + ' function')

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
    // Reflect.defineMetadata(metadataKey, metadataValue, target);
    Object.defineProperty(source, '__settable', {
        value: proprieties
    })
    // source.__settable = proprieties;
    // return Reflect.defineMetadata('settableProprieties', proprieties, target);   
}

export function Settable<T extends {new(...args:any[]):{}}>(constructor:T) {
    var newConstructor : any  = (options: {} = {}) => {
        // Create the instance
        let instance = new constructor(options);

        let settableProprieties = constructor.prototype.__settable;
        console.log(settableProprieties);
        settableProprieties.forEach((proprietyKey) => {
            let type = Reflect.getMetadata("design:type", instance, proprietyKey).name;
            // console.log(options[proprietyKey]);
            // console.log(Object.getPrototypeOf(options[proprietyKey]));

            if (options !== undefined && options[proprietyKey] !== undefined 
                && options[proprietyKey] instanceof Object
                && Object.getPrototypeOf(options[proprietyKey]).constructor.name === type) {
                    instance[proprietyKey] = options[proprietyKey];
                }
        });
        return instance;
    }
    newConstructor.prototype = constructor.prototype;
    return newConstructor;
}


export class SettableC {
    __settable = []

    constructor(options = {}) {
        let settableProprieties = this.__settable;
        console.log(settableProprieties);
        settableProprieties.forEach((proprietyKey) => {
            let type = Reflect.getMetadata("design:type", this, proprietyKey).name;
            // console.log(options[proprietyKey]);
            // console.log(Object.getPrototypeOf(options[proprietyKey]));

            if (options !== undefined && options[proprietyKey] !== undefined 
                // && options[proprietyKey] instanceof Object
                // && Object.getPrototypeOf(options[proprietyKey]).constructor.name === type
                ) {
                    if ( typeof options[proprietyKey] === typeof type) {

                        this[proprietyKey] = options[proprietyKey];
                    } else {
                        console.log('BAdum tss')
                    }
                }
        });
    }
}