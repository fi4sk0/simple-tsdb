const { before, describe, it } = require('mocha');
const assert = require('assert')

const SimpleTsdb = require('./index.js');
const path = require('path')
const fs = require('fs')
const Metadata = require('./Metadata.js')


const testdb = path.join(__dirname, 'mydb.sqlite');


let data = [
    [0, 1.0],
    [1, 1.1],
    [2, 1.2],
    [3, 1.3],
    [4, 1.4],
    [5, 1.5],
    [6, 1.6]
]


before(() => {

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
})

const TEST_CONTAINER_ID = "testcontainer";

describe('Database and Containers', function testInsertPoints() {

    let myDb;

    it('should create a database', () => {
        myDb = new SimpleTsdb({
            db: testdb
        });
    })

    let myContainer

    it('should create a container', () => {
        myContainer = myDb.createContainer("Supercontainer", null, TEST_CONTAINER_ID);
        assert.ok(myContainer.id, "id doesn't exist");
    })

    it('should retrieve the same container', () => {
        let oldContainer = myDb.getContainer(myContainer.id);
        assert.ok(oldContainer, "couldn't get container")
        assert.strictEqual(oldContainer.name, myContainer.name, "Container names differ")
    })

    it('should change and save the container description', () => {
        myContainer.description = "My very long description"
        myContainer.save();

        let oldContainer = myDb.getContainer(myContainer.id);

        assert.strictEqual(oldContainer.description, myContainer.description, "Container descriptions differ")
    })

    it('should add a stream', () => {
        var pressure = myContainer.createStream("Test/Vacuum/Pressure");
        assert.ok(pressure, "didn't add stream to container properly")
    })

    it('should find that stream', () => {
        var streamNames = myContainer.getStreamNames();
        assert.ok(streamNames.includes("Test/Vacuum/Pressure"), "not ok")
    });

    it('should insert data to that stream', () => {

        var pressure = myContainer.getStream("Test/Vacuum/Pressure");
        pressure.addData(data);

        let retrievedData = pressure.getData(0, 6);

        assert.ok(retrievedData.length == data.length, "Data does not have the same size as retrievedData")

    })

    it('should import line protocol file', async () => {
        var importContainer = await myDb.importLineProtocol(path.join(__dirname, 'testdata', 'import.txt'));
        assert.ok(importContainer.id == '60f68cb7f1e52211ef62161b')
    })
})

//     data[2][1] = null;

//     let t1 = new Date().getTime();
//     temperature.addData(data)
//     let t2 = new Date().getTime();

//     console.log()
//     console.log(`INSERT: ${t2 - t1}ms for ${data.length} values`)

//     t1 = new Date().getTime();
//     var d = temperature.getData(data[0][0], data[data.length - 1][0]);
//     t2 = new Date().getTime();
//     console.log(`READ: ${t2 - t1}ms for ${d.length} values`)

//     t1 = new Date().getTime();
//     const newInterval = temperature.expandInterval(0.2, 10);
//     t2 = new Date().getTime();
//     console.log(`EXPAND: ${t2 - t1}ms for ${d.length} values`)
//     console.log(newInterval)


//     const retrievedData = temperature.getDataResampled(data[0][0], data[data.length - 1][0], 100);

//     // Check if it's the same
//     for (let i = 0; i < retrievedData.length; i++) {
//         if (
//             retrievedData[i][0] != data[i][0] ||
//             retrievedData[i][1] != data[i][1]) {
//             console.log("oh no")
//             break;
//         }
//     }

//     console.log(retrievedData)

//     var m = temperature.appendMetadata("information", {
//         foo: "foo",
//         bar: 0xdeadbeef,
//         baz: [5, 6, { omg: "this is awesome" }]
//     })

//     var m2 = Metadata.get(myDb.db, m.id)

//     console.log(m2.payload)

//     m2.payload.baz = "new";
//     m2.save();

//     m2 = Metadata.get(myDb.db, m.id)

//     console.log(m2.payload)


//     var tempStream = importContainer.getStream('LSM_HS_SensorCan81_Temperature_Room');

//     console.log(tempStream);

//     var justId = importContainer.id;
//     console.log(justId);

//     var retrievedContainer = myDb.getContainer(justId);
//     console.log(retrievedContainer)

//     tempStream.get

// }

// love();




