const betterSqlite3 = require('better-sqlite3')
const fs = require('fs')
const path = require('path')
const Container = require('./Container.js')
const readline = require('readline')

module.exports = class SimpleTsdb {

    constructor(options) {
        this.db = betterSqlite3(options.db, options)
        this.db.pragma('journal_mode = WAL')
        this.createTables();
    }

    createContainer(name, description, id) {
        return new Container(this.db, id, name, description, true);
    }

    getContainer(id) {
        return new Container(this.db, id);
    }

    createTables() {
        var sql = fs.readFileSync(path.join(__dirname, 'sql', 'createDatabase.sql')).toString();
        this.db.exec(sql);
    }

    async importLineProtocol(path) {

        return new Promise(res => {

            const rl = readline.createInterface({
                input: fs.createReadStream(path),
                output: process.stdout,
                terminal: false
            });
    
            let containerId;
            let allData = {};
    
            rl.on('line', (line) => {
                var [id, data, timestamp] = line.split(/(?<!\\)\s+/); // split by whitespace, not by escaped whitespace

                if (id == null || data == null || timestamp == null) {
                    return;
                }
    
                if (id.startsWith("#")) return;
    
                timestamp = +timestamp;
                containerId = id;
    
                var datum = data.split(",");
    
                for(var data of datum) {
                    let [name, value] = data.split("=")

                    // Replace escaped whitespace from name
                    name = name.replace(/\\\s/g, " ")
    
                    if (!allData.hasOwnProperty(name)) {
                        allData[name] = []
                    }
                    allData[name].push([timestamp, JSON.parse(value)]);
                }
                
    
            }).on('close', () => {
                var container = this.createContainer("Line Protocol Import", null, containerId);

                for (let streamName of Object.keys(allData)) {
                    var series = allData[streamName];
    
                    var stream = container.createStream(streamName);
                    stream.addData(series)
                }
                res(container);
            });
            
        })

    }


}
