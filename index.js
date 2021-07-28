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
            var container = this.createContainer("Line Protocol Import", null);

            const rl = readline.createInterface({
                input: fs.createReadStream(path),
                output: process.stdout,
                terminal: false
            });
    
            let containerId;
            let allData = {};
    
            rl.on('line', (line) => {
                var [id, data, timestamp] = line.split(" ");
    
                if (id.startsWith("#")) return;
    
                timestamp = +timestamp;
                containerId = id;
    
                var datum = data.split(",");
    
                for(var data of datum) {
                    let [name, value] = data.split("=")
    
                    if (!allData.hasOwnProperty(name)) {
                        allData[name] = []
                    }
                    allData[name].push([timestamp, JSON.parse(value)]);
                }
                
    
            }).on('close', () => {
    
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
