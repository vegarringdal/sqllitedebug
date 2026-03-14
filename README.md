# Sqlite Sync OPFS (no custom headers needed)

weird little experiment Im having with custom sync vfs


* `npm install`
* `npm start`
* [livedemo](https://vegarringdal.github.io/sqllitedebug/dist/index.html)

```ts

const result = sqliteWorkerClientInstance.execute({
    mainDbPath: "main.db",
    additionalDbPaths: [],
    statements: [
        {
            sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
        },
        {
            sql: "INSERT INTO test (name) VALUES (?)",
            binding: Array.from(Array(5)).map((_, i) => [
                `Hello from custom (ALT)VFS:${i}`
            ])
        },
        {
            sql: "select * from test",
            collect: true // collect rows returned
        },
            
        ],
        lockmode: "exclusive", // can used "shared" for multiple readers if you dont plan to write and browser support it, it changes to exclusive if its not supported
        lockTimeout: 0, // for waiting, useful if you have multiple queries that will run at once from diffrent contexts
        progressSize: 10000, // 0 = no callbacks..
        collectLog: true, // get string array with all logs, useful for debugging
        debugPrint: false, // print to console log as we get logs (useful for debugging
        printInputOptions: false // print input, useful for debugging                           
    }, 
    (type:"STATMENT" | "ROW", rowno: number, total: total)=>{
        // show progress... this is optional..
        // if you dont pass inn callback, progressSize is set to 0
});

```

> result

```json
{
   {
    "data": [
        [],
        []
    ],
    "logs": [
        "bWorker    - 0000 ms [0000]  - Locking: main.db, lockmode: exclusive",
        "bWorker    - 0185 ms [0185]  - Lock ok: main.db",
        "bWorker    - 0185 ms [0000]  - All locks aquired, calling worker",
        "iWorker    - 0185 ms [0000]  - filehandle about to be created",
        "iWorker    - 0186 ms [0001]  - filehandled created: main.db, lockmode:readwrite",
        "iWorker    - 0188 ms [0003]  - filehandled created: main.db-journal, lockmode:readwrite",
        "iWorker    - 0189 ms [0001]  - sqlite3InitModule() start",
        "iWorker    - 0220 ms [0031]  - sqlite3InitModule() done",
        "iWorker    - 0220 ms [0000]  - new SyncOpfsVfs start",
        "iWorker    - 0221 ms [0001]  - new SyncOpfsVfs done",
        "iWorker    - 0221 ms [0000]  - new sqlite3.oo1.DB start",
        "iWorker    - 0225 ms [0003]  - new sqlite3.oo1.DB done",
        "iWorker    - 0242 ms [0017]  - Statement start 000 - CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)",
        "iWorker    - 0242 ms [0000]  - Statement bindings: 0",
        "iWorker    - 0242 ms [0000]  - Statement done  000",
        "iWorker    - 0242 ms [0000]  - Statement start 001 - INSERT INTO test (name) VALUES (?)",
        "iWorker    - 0242 ms [0000]  - Statement bindings: 5",
        "iWorker    - 0246 ms [0004]  - Statement done  001",
        "iWorker    - 0246 ms [0000]  - db commit start",
        "iWorker    - 0253 ms [0007]  - db commit done",
        "iWorker    - 0253 ms [0000]  - db close start",
        "iWorker    - 0254 ms [0001]  - db close done",
        "iWorker    - 0254 ms [0000]  - cleanup file handles start",
        "iWorker    - 0256 ms [0002]  - cleanup file handles done - sending data",
        "aWorker    - 0481 ms [0226]  - data recived - unlocking",
        "aWorker    - 0481 ms [0000]  - unlocking done",
        "aWorker    - 0482 ms [0000]  - done"
    ],
    "transferedLogtime": [
        1773508077234.4,
        1773508077490
    ],
    "err": null,
    "execTimeWorker": 255.60009765625, // this is dependant of browser, most time is in locking/unlocking
    "execTime": 481.60000014305115 // this is dependant of browser, most time is in locking/unlocking
}

```