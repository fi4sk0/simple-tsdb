module.exports = class Metadata {

    id;
    payload;

    constructor(db, type, id, payload) {
        this.id = id;
        this.db = db;
        this.type = type;
        this.payload = payload;
    }

    static forStream(stream, type) {
        var stmt = stream.db.prepare("SELECT * FROM [Metadata] WHERE StreamId = ? AND Type = ?")

        let data = stmt.all([
            stream.id,
            type
        ]);

        return data.map(d => new Metadata(stream.db, d.type, d.MetadataId, JSON.parse(d.Payload)))
    }

    static insertForStream(stream, type, payload) {
        var stmt = stream.db.prepare(`INSERT INTO [Metadata] 
        (StreamId, Type, Payload) VALUES (?, ?, ?)`)

        var info = stmt.run([
            stream.id,
            type,
            JSON.stringify(payload, null, 2)
        ]);

        return new Metadata(stream.db, type, info.lastInsertRowid, payload);
    }

    static forContainer(container, type) {
        var stmt = container.db.prepare("SELECT * FROM [Metadata] WHERE ContainerId = ? AND Type = ?")

        let data = stmt.all([
            container.id,
            type
        ]);

        return data.map(d => new Metadata(container.db, d.type, d.MetadataId, JSON.parse(d.Payload)))        
    }

    static insertForContainer(container, type, payload) {
        var stmt = container.db.prepare(`INSERT INTO [Metadata] 
        (ContainerId, Type, Payload) VALUES (?, ?, ?)`)

        var info = stmt.run([
            container.id,
            type,
            JSON.stringify(payload, null, 2)
        ]);

        return new Metadata(container.db, type, info.lastInsertRowid, payload);
    }

    static updateWithId(db, id, payload) {
        var stmt = db.prepare(`UPDATE [Metadata] SET Payload = ? WHERE MetadataId = ?`)

        stmt.run([
            JSON.stringify(payload, null, 2),
            id,
        ]);
    }

    static get(db, id) {
        var stmt = db.prepare("SELECT * FROM [Metadata] WHERE MetadataId = ?")

        let data = stmt.get([
            id
        ]);

        return new Metadata(db, data.Type, data.MetadataId, JSON.parse(data.Payload));
    }

    save() {
        Metadata.updateWithId(this.db, this.id, this.payload);
    }

}