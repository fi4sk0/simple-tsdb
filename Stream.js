const resample = require('./resampling.js')
const Metadata = require('./Metadata.js');

module.exports = class Stream {

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

    appendMetadata(type, payload) {
        return Metadata.insertForStream(this, type, payload)
    }

    getMetadata(type) {
        return Metadata.forStream(this, type);
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

    delete() {
        var stmt = this.db.prepare(`DELETE FROM [Streams] WHERE StreamId = ?`)

        stmt.run([
            this.id,
        ]);
        this.id = null;
    }

    load() {
        var stmt = this.db.prepare(`SELECT * FROM [Streams] WHERE ContainerId = ? AND Name = ?`)

        let data = stmt.get([
            this.containerId,
            this.name
        ]);

        if (data == null) {
            throw new Error(`No stream with this name (${this.name}) in given container (${this.containerId})`)
        }

        this.id = data.StreamId;
        this.name = data.Name;
        this.containerId = data.ContainerId;
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