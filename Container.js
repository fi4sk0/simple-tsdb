const { v4 } = require('uuid');;
const Stream = require('./Stream.js');
const Metadata = require('./Metadata.js');

module.exports = class Container {

    id;
    description;
    name;
    created;
    updated;

    constructor(db, id, name, description, create) {
        this.db = db;
        this.id = id;
        this.name = name;
        this.description = description;

        if (this.id == null) {
            this.id = v4()
        }

        if (create) {
            this.insert()
        } else {
            this.load();
        }
    }

    appendMetadata(type, payload) {
        return Metadata.insertForContainer(this, type, payload)
    }


    getMetadata(type) {
        return Metadata.forContainer(this, type);
    }

    insert() {

        var stmt = this.db.prepare(`INSERT INTO [Containers] 
            (ContainerId, Name, Description, Created, Updated) VALUES 
            (?, ?, ?, ?, ?)`);

        this.created = new Date().getTime();
        this.updated = this.created;

        stmt.run([
            this.id,
            this.name,
            this.description,
            this.created,
            this.updated
        ])
        

    }

    delete() {
        var stmt = this.db.prepare(`DELETE FROM [Containers] WHERE ContainerId = ?`)

        stmt.run([
            this.id,
        ]);
        this.id = null;
    }

    save() {

        const stmt = this.db.prepare(`UPDATE [Containers] SET
            ContainerId = ?, 
            Name = ?,
            Description = ?,
            Updated = ?`);

        stmt.run([this.id, this.name, this.description, new Date().getTime()]);

    }

    load() {

        const stmt = this.db.prepare("SELECT * FROM [Containers] WHERE ContainerId = ?");
        const c = stmt.get(this.id);
        this.name = c.Name;
        this.description = c.Description;
        this.created = new Date(c.Created);
        this.updated = new Date(c.Updated);
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