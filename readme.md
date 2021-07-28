# Simple TSDB
A simple time series database. Another one. There are uncountable on the market, so why one more? Simplicity: It's a sqlite database with little more dependencies than this and only a couple of lines of code for storing and retrieving time series. 

## Usage
To access and write data, create a timeseries database object like follows.
```javascript
let myTSDB = new SimpleTsdb({
    db: 'myfolder/test.sqlite3'
})
```
This creates/opens and maintains a sqlite3 database (using better-sqlite3). All data is dumped as a BLOB into the `Data`-table. Every data point belongs to a `Stream`, which lives in the `Streams`-table. All streams refer to a `Container`, which lives in the `Containers`-table.

After you've created the database object, go on as follows:

```javascript
let myContainer = myTSDB.createContainer("Container Name", "some optional description")

let temperatureStream = myContainer.createStream("Temperature")
temperatureStream.addData([[time, value], [time, value], ...])
```

You can create as many containers as you like. Within a container, the stream `Name` is unique.

To retrieve data, you need the containers id, which is accessible liek follows:
```javascript
const containerId = myContainer.id
let oldContainer = myTSDB.getContainer(containerId)
let streamNames = oldContainer.getStreamNames() // ['Temperature']

let oldTemperatureStream = oldContainer.getStream('Temperature')
let data = oldTemperatureStream.getDataRaw(t1, t2) // Just gets all data points where timestamp is in between t1 and t2
let data = oldTemperatureStream.getData(t1, t2) // Same as getDataRaw, but extends the (t1, t2) interval to the point before t1 and after t2.
let data = oldTemperatureStream.getDataResampled(t1, t2, count) // Same as getData but resamples the retrieved points into bins and calculates the min/max/mean 
```

## Develop
```
yarn
yarn dev
```


## SQL structure
Table containers