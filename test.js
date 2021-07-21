import SimpleTsdb from './index.js'

let myDb = new SimpleTsdb({
    db: ':memory:'
});

console.log(myDb)

let container = myDb.findOrCreateContainer()

console.log(container);


