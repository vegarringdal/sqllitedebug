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
                },
                {
                    sql: "select * from test",
                    collect: true // collect rows returned
                },
                    
                ],
                lockmode: "exclusive",
                lockTimeout: 0,
                progressSize: 10000,
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
        [],
        [
            [
                1,
                "Hello from custom (ALT)VFS:0"
            ],
            [
                2,
                "Hello from custom (ALT)VFS:1"
            ],
            [
                3,
                "Hello from custom (ALT)VFS:2"
            ],
            [
                4,
                "Hello from custom (ALT)VFS:3"
            ],
            [
                5,
                "Hello from custom (ALT)VFS:4"
            ],
            [
                6,
                "Hello from custom (ALT)VFS:5"
            ],
            [
                7,
                "Hello from custom (ALT)VFS:6"
            ],
            [
                8,
                "Hello from custom (ALT)VFS:7"
            ],
            [
                9,
                "Hello from custom (ALT)VFS:8"
            ],
            [
                10,
                "Hello from custom (ALT)VFS:9"
            ]
        ]
    ],
    "logs": [
        "0001 ms  - filehandle about to be created",
        "0001 ms  - filehandled created: main.db",
        "0002 ms  - filehandled created: main.db-journal",
        "0002 ms  - new SyncOpfsVfs start",
        "0002 ms  - new SyncOpfsVfs done",
        "0002 ms  - new sqlite3.oo1.DB start",
        "0003 ms  - new sqlite3.oo1.DB done",
        "0004 ms  - Statement start 000 - CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)",
        "0004 ms  - Statement bindings: 0",
        "0004 ms  - Statement done  000",
        "0004 ms  - Statement start 001 - INSERT INTO test (name) VALUES (?)",
        "0004 ms  - Statement bindings: 10",
        "0005 ms  - Statement done  001",
        "0005 ms  - Statement start 002 - select * from test",
        "0005 ms  - Statement bindings: 0",
        "0005 ms  - Statement done  002",
        "0005 ms  - db commit start",
        "0015 ms  - db commit done",
        "0015 ms  - db close start",
        "0015 ms  - db close done",
        "0015 ms  - cleanup file handles start",
        "0015 ms  - cleanup file handles done"
    ],
    "err": null,
    "execTimeWorker": 15.399999976158142,
    "execTime": 136.79999995231628
}

```