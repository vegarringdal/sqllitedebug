# Sqlite Sync OPFS (no custom headers needed)

weird little experiment Im having with custom sync vfs


* `npm install`
* `npm start`
* [livedemo](https://vegarringdal.github.io/sqllitedebug/dist/index.html)

```ts

consr result = sqliteWorkerClientInstance.execute({
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
                lockmode: "exclusive", // can used "shared" for multiple readers if you dont plan to write and browser support it
                lockTimeout: 0, // for waiting, useful if you have multiple queries that will run at once from diffrent contexts
                progressSize: 10000, // 0 = no callbacks..
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs                            
            }, 
            (type:"STATMENT" | "ROW", rowno: number, total: total)=>{
                // show progress... this is optional..
                // if you dont pass inn callback, progressSize is set to 0
            })

```

> result

```json
{
    "data": [
        [],
        []
    ],
    "logs": [
        "bWorker    - 0000 ms [0000]  - Locking: main.db",
        "bWorker    - 0168 ms [0168]  - Lock ok: main.db",
        "bWorker    - 0168 ms [0000]  - All locks aquired, calling worker",
        "iWorker    - 0169 ms [0000]  - filehandle about to be created",
        "iWorker    - 0169 ms [0001]  - filehandled created: main.db",
        "iWorker    - 0170 ms [0000]  - filehandled created: main.db-journal",
        "iWorker    - 0170 ms [0000]  - new SyncOpfsVfs start",
        "iWorker    - 0171 ms [0002]  - new SyncOpfsVfs done",
        "iWorker    - 0171 ms [0000]  - new sqlite3.oo1.DB start",
        "iWorker    - 0172 ms [0001]  - new sqlite3.oo1.DB done",
        "iWorker    - 0173 ms [0000]  - Statement start 000 - CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)",
        "iWorker    - 0173 ms [0000]  - Statement bindings: 0",
        "iWorker    - 0173 ms [0000]  - Statement done  000",
        "iWorker    - 0173 ms [0000]  - Statement start 001 - INSERT INTO test (name) VALUES (?)",
        "iWorker    - 0173 ms [0000]  - Statement bindings: 5",
        "iWorker    - 0173 ms [0001]  - Statement done  001",
        "iWorker    - 0173 ms [0000]  - db commit start",
        "iWorker    - 0183 ms [0009]  - db commit done",
        "iWorker    - 0183 ms [0000]  - db close start",
        "iWorker    - 0183 ms [0000]  - db close done",
        "iWorker    - 0183 ms [0000]  - cleanup file handles start",
        "iWorker    - 0185 ms [0002]  - cleanup file handles done - sending data",
        "aWorker    - 0330 ms [0145]  - data recived - unlocking",
        "aWorker    - 0330 ms [0000]  - unlocking done",
        "aWorker    - 0330 ms [0000]  - done"
    ],
    "transferedLogtime": [
        1773162362457.7,
        1773162362642.5
    ],
    "err": null,
    "execTimeWorker": 184.800048828125,
    "execTime": 330
}

```