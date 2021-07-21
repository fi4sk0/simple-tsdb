import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';

export default class SimpleTsdb {

    constructor(options) {
        this.db = new sqlite3.Database(options.db)
    }

    findOrCreateContainer(id) {
        return new Container(this.db, id);
    }
}

export class Container {

    constructor(db, id) {
        this.db = db;
        
        if (id == null) {
            this.createNewContainer();
        }
    }

    createNewContainer() {
        this.id = uuidv4();
    }


    createStream() {

    }

}

export class Stream {

}
