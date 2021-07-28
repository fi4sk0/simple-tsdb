const SimpleTsdb = require('./index.js');
const path = require('path')
const fs = require('fs')
const Metadata = require('./Metadata.js')

const testdb = path.join(__dirname, 'mydb.sqlite');

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

async function love() {
    let myDb = new SimpleTsdb({
        db: testdb
    });

    var myContainer = myDb.createContainer("Supercontainer", null, "AssId");

    myContainer.description = "My very long description"
    myContainer.save();

    var myOtherContainer = myDb.createContainer("Other Container");


    var pressure = myContainer.createStream("Test/Vacuum/Pressure");
    var temperature = myContainer.createStream("Test/Vacuum/Temperature");

    var names = myContainer.getStreamNames();
    console.log(names);


    const dt = .1;
    const values = 5000;
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


    const retrievedData = temperature.getDataResampled(data[0][0], data[data.length - 1][0], 100);

    // Check if it's the same
    for (let i = 0; i < retrievedData.length; i++) {
        if (
            retrievedData[i][0] != data[i][0] ||
            retrievedData[i][1] != data[i][1]) {
            console.log("oh no")
            break;
        }
    }

    console.log(retrievedData)

    var m = temperature.appendMetadata("information", {
        foo: "foo",
        bar: 0xdeadbeef,
        baz: [5, 6, { omg: "this is awesome" }]
    })

    var m2 = Metadata.get(myDb.db, m.id)

    console.log(m2.payload)

    m2.payload.baz = "new";
    m2.save();

    m2 = Metadata.get(myDb.db, m.id)

    console.log(m2.payload)

    var importContainer = await myDb.importLineProtocol(path.join(__dirname, 'import.txt'));

    var tempStream = importContainer.getStream('LSM_HS_SensorCan81_Temperature_Room');

    console.log(tempStream);

    var justId = importContainer.id;
    console.log(justId);

    var retrievedContainer = myDb.getContainer(justId);
    console.log(retrievedContainer)

    tempStream.get

}

love();




