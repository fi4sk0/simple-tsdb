import SimpleTsdb from './index.js'
import path from 'path'
import fs from 'fs'

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const testdb = path.join(__dirname, 'mydb.sql');

if (fs.existsSync(testdb)) {
    try {
        fs.unlinkSync(testdb);
    } catch {

    }
    try {
        fs.unlinkSync(testdb + "-shm");
    } catch {

    }

    try {
        fs.unlinkSync(testdb + "-wal");
    } catch {

    }
}

function love() {
    let myDb = new SimpleTsdb({
        db: testdb
    });

    var myContainer = myDb.createContainer("Supercontainer");

    myContainer.description = "My very long description"
    myContainer.save();

    var pressure = myContainer.createStream("Test/Vacuum/Pressure");
    var temperature = myContainer.createStream("Test/Vacuum/Temperature");

    var names = myContainer.getStreamNames();
    console.log(names);


    const dt = .1;
    const values = 50000;
    let t = 0;

    let data = []
    for (let i = 0; i < values; i++) {

        data.push([t, Math.sin(t * 2 * Math.PI / 10)])

        t += dt;
    }

    data[2][1] = null;

    let t1 = new Date().getTime();
    temperature.addData(data)
    let t2 = new Date().getTime();

    console.log()
    console.log(`INSERT: ${t2 - t1}ms for ${data.length} values`)

    t1 = new Date().getTime();
    var d = temperature.getData(data[0][0], data[data.length - 1][0]);
    t2 = new Date().getTime();
    console.log(`READ: ${t2 - t1}ms for ${d.length} values`)

    t1 = new Date().getTime();
    const newInterval = temperature.expandInterval(0.2, 10);
    t2 = new Date().getTime();
    console.log(`EXPAND: ${t2 - t1}ms for ${d.length} values`)
    console.log(newInterval)


    const retrievedData = temperature.getData(data[0][0], data[data.length - 1][0]);

    // Check if it's the same
    for (let i = 0; i < retrievedData.length; i++) {
        if (
            retrievedData[i][0] != data[i][0] ||
            retrievedData[i][1] != data[i][1]) {
            console.log("oh no")
            break;
        }
    }

    var resampledData = temperature.getDataResampled(10, 20, 5)
    console.log(resampledData);


}

love();




