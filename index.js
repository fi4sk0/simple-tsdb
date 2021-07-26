import { v4 as uuidv4 } from 'uuid';
import betterSqlite3 from 'better-sqlite3'
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { resample } from './resampling.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class SimpleTsdb {

    constructor(options) {
        this.db = betterSqlite3(options.db, options)
        this.db.pragma('journal_mode = WAL')
        this.createTables();
    }

    createContainer(name, description) {
        return new Container(this.db, null, name, description);
    }

    getContainer(id) {
        return new Container(this.db, id);
    }

    createTables() {
        var sql = fs.readFileSync(path.join(__dirname, 'sql', 'createDatabase.sql')).toString();
        this.db.exec(sql);
    }

}

export class Container {

    id;
    description;
    name;
    created;
    updated;

    constructor(db, id, name, description) {
        this.db = db;
        this.id = id;
        this.name = name;
        this.description = description;

        if (this.id == null) {
            this.createNewContainer();
        } else {
            this.load();
        }
    }

    createNewContainer() {
        this.id = uuidv4()
        this.insert()

    }

    insert() {

        var stmt = this.db.prepare(`INSERT INTO [Containers] 
            (ContainerId, Name, Description, Created, Updated) VALUES 
            (?, ?, ?, ?, ?)`);

        let info = stmt.run([
            this.id,
            this.name,
            this.description,
            new Date().getTime(),
            new Date().getTime()
        ])

    }

    save() {

        const stmt = this.db.prepare(`UPDATE [Containers] SET
            ContainerId = ?, 
            Name = ?,
            Description = ?,
            Updated = ?`);

        const c = stmt.run([this.id, this.name, this.description, new Date().getTime()]);

    }

    load() {

        const stmt = this.db.prepare("SELECT * FROM [Containers] WHERE ContainerId = ?");
        const c = stmt.get(this.id);

    }

    createStream(name) {
        return new Stream(this.db, this.id, name, true);
    }

    getStreamNames() {
        const stmt = this.db.prepare("SELECT Name FROM [Streams] WHERE ContainerId = ?");
        return stmt.all(this.id).map(d => d.Name);
    }

    getStream(name) {
        return new Stream(this.db, this.id, name, false);
    }


}

export class Stream {

    id;
    db;
    containerId;
    name;

    constructor(db, containerId, name, create) {
        this.db = db
        this.containerId = containerId
        this.name = name;

        if (create) {
            this.insert();
        } else {
            this.load();
        }
    }

    insert() {

        var stmt = this.db.prepare(`INSERT INTO [Streams] 
        (ContainerId, Name, Created, Updated) VALUES (?, ?, ?, ?)`)

        var info = stmt.run([
            this.containerId,
            this.name,
            new Date().getTime(),
            new Date().getTime()
        ]);

        this.id = info.lastInsertRowid;

    }

    load() {
        var stmt = this.db.prepare(`SELECT * FROM [Streams] WHERE ContainerId = ? AND Name = ?`)

        let data = stmt.get([
            this.containerId,
            this.name
        ]);

        this.id = data.StreamId;
    }

    addData(data) {

        const insert = this.db.prepare(`INSERT INTO [Data] (StreamId, Timestamp, Value) VALUES ( ${this.id}, ?, ?)`);

        const insertMany = this.db.transaction((d) => {
            for (const datum of d) insert.run(datum);
        });

        insertMany(data)

    }

    /* Gets the data points within a given interval */
    getDataRaw(t1, t2) {
        const stmt = this.db.prepare(`SELECT Timestamp, Value FROM [Data] WHERE StreamId = ? AND Timestamp >= ? AND Timestamp <= ?`).raw()
        return stmt.all([
            this.id,
            t1,
            t2
        ]);
    }

    getData(t1, t2) {
        const interval = this.expandInterval(t1, t2);
        return this.getDataRaw(...interval)
    }

    getDataResampled(t1, t2, count) {
        
        return resample(t1, t2, count, this.getData(t1, t2))
    }

    expandInterval(t1, t2) {

        const lowerBound = this.db.prepare(`SELECT Timestamp FROM [Data] WHERE StreamId = ? AND Timestamp <= ? ORDER BY Timestamp DESC`).pluck()
        const lb = lowerBound.get([
            this.id,
            t1
        ])

        const upperBound = this.db.prepare(`SELECT Timestamp FROM [Data] WHERE StreamId = ? AND Timestamp >= ? ORDER BY Timestamp ASC`).pluck()
        const ub = upperBound.get([
            this.id,
            t2
        ])

        return [lb ?? t1, ub ?? t2]
    }


}
