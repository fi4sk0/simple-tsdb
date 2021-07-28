CREATE TABLE IF NOT EXISTS [Containers] (
    [ContainerId] STRING NOT NULL PRIMARY KEY,
    [Name] STRING,
    [Description] STRING,
    [Created] DATETIME,
    [Updated] DATETIME
);

CREATE TABLE IF NOT EXISTS [Streams] (
    [StreamId] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [ContainerId] STRING NOT NULL REFERENCES [Containers] ON DELETE CASCADE,
    [Name] STRING,
    [Created] DATETIME,
    [Updated] DATETIME
);

CREATE INDEX IF NOT EXISTS idx_streams 
ON [Streams] (ContainerId, Name);

CREATE TABLE IF NOT EXISTS [Data] (
    [StreamId] INTEGER NOT NULL REFERENCES [Streams] ON DELETE CASCADE,
    [Timestamp] INTEGER NOT NULL,
    [Value] BLOB
);

CREATE INDEX IF NOT EXISTS idx_data
ON [Data] (StreamId, Timestamp);

CREATE TABLE IF NOT EXISTS [Metadata] (
    [MetadataId] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [StreamId] INTEGER REFERENCES [Streams] ON DELETE CASCADE,
    [ContainerId] STRING REFERENCES [Containers] ON DELETE CASCADE,
    [Type] STRING NOT NULL,
    [Payload] TEXT NOT NULL
)
