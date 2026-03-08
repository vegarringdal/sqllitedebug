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
            binding: Array.from(Array(10)).map((_, i) => [
                `Hello from custom (ALT)VFS:${i}`
            ])
        }
    ],
    collectLog: logCollect,
    debugPrint: debugpPrint,
    printInputOptions: printArgs
}, (type:"STATMENT" | "ROW", rowno: number, total: total)=>{
    // show progress... this is optional..
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
        "0003 ms  - filehandle about to be created",
        "0010 ms  - filehandled created: main.db",
        "0011 ms  - filehandled created: main.db-journal",
        "0011 ms  - sqlite3InitModule() start",
        "0036 ms  - sqlite3InitModule() done",
        "0036 ms  - new SyncOpfsVfs start",
        "0037 ms  - new SyncOpfsVfs done",
        "0037 ms  - new sqlite3.oo1.DB start",
        "0039 ms  - new sqlite3.oo1.DB done",
        "0054 ms  - Statement start 000 - CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)",
        "0054 ms  - Statement bindings: 0",
        "0054 ms  - Statement done  000",
        "0054 ms  - Statement start 001 - INSERT INTO test (name) VALUES (?)",
        "0054 ms  - Statement bindings: 10",
        "0056 ms  - Statement done  001",
        "0056 ms  - db commit start",
        "0063 ms  - db commit done",
        "0063 ms  - db close start",
        "0064 ms  - db close done",
        "0064 ms  - cleanup file handles start",
        "0066 ms  - cleanup file handles done"
    ],
    "err": null,
    "execTimeWorker": 65.79999995231628,
    "execTime": 568.5
}

```