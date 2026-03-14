import type { SqlExecuteOption } from "../SqliteWorkerClient/types";
import { sqliteWorkerClientInstance01 } from "./sqliteWorkerClientInstance";

export const samples = [
    {
        buttonTitle: "Insert 25k rows into main.db (exclusive lock)",
        instance: sqliteWorkerClientInstance01,
        getClassName(isActive: boolean) {
            return `p-1 bg-indigo-500 m-1 ${isActive ? "bg-indigo-500/50" : ""}`;
        },
        options(logCollect: boolean, debugpPrint: boolean, printArgs: boolean): SqlExecuteOption {
            return {
                mainDbPath: "main.db",
                additionalDbPaths: [],
                statements: [
                    {
                        sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
                    },
                    {
                        sql: "INSERT INTO test (name) VALUES (?)",
                        binding: Array.from(Array(25_000)).map((_, i) => [
                            `Hello from custom (ALT)VFS:${i}`
                        ])
                    }
                ],
                lockmode: "exclusive",
                lockTimeout: 0,
                progressSize: 10000,
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs
            };
        }
    },
    {
        buttonTitle: "Insert 25k rows into alt.db (exclusive lock)",
        instance: sqliteWorkerClientInstance01,
        getClassName(isActive: boolean) {
            return `p-1 bg-indigo-500 m-1 ${isActive ? "bg-indigo-500/50" : ""}`;
        },
        options(logCollect: boolean, debugpPrint: boolean, printArgs: boolean): SqlExecuteOption {
            return {
                mainDbPath: "alt.db",
                additionalDbPaths: [],
                statements: [
                    {
                        sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
                    },
                    {
                        sql: "INSERT INTO test (name) VALUES (?)",
                        binding: Array.from(Array(25_000)).map((_, i) => [
                            `Hello from custom (ALT)VFS:${i}`
                        ])
                    }
                ],
                lockmode: "exclusive",
                lockTimeout: 0,
                progressSize: 10000,
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs
            };
        }
    },
    {
        buttonTitle: "delete all test - main.db (exclusive lock)",
        instance: sqliteWorkerClientInstance01,
        getClassName(isActive: boolean) {
            return `p-1 bg-red-600 m-1 ${isActive ? "bg-red-600/50" : ""}`;
        },
        options(logCollect: boolean, debugpPrint: boolean, printArgs: boolean): SqlExecuteOption {
            return {
                mainDbPath: "main.db",
                additionalDbPaths: [],

                statements: [
                    {
                        sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
                    },
                    {
                        sql: "delete from test"
                    }
                ],
                lockmode: "exclusive",
                lockTimeout: 0,
                progressSize: 10000,
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs
            };
        }
    },
    {
        buttonTitle: "delete all test - alt.db (exclusive lock)",
        instance: sqliteWorkerClientInstance01,
        getClassName(isActive: boolean) {
            return `p-1 bg-red-600 m-1 ${isActive ? "bg-red-600/50" : ""}`;
        },
        options(logCollect: boolean, debugpPrint: boolean, printArgs: boolean): SqlExecuteOption {
            return {
                mainDbPath: "alt.db",
                additionalDbPaths: [],

                statements: [
                    {
                        sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
                    },
                    {
                        sql: "delete from test"
                    }
                ],
                lockmode: "exclusive",
                lockTimeout: 0,
                progressSize: 10000,
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs
            };
        }
    },
    {
        buttonTitle:
            "select all test - main.db (shared lock, can use on long running selects in multiple tabs)",
        instance: sqliteWorkerClientInstance01,
        getClassName(isActive: boolean) {
            return `p-1 bg-green-600 m-1 ${isActive ? "bg-green-600/50" : ""}`;
        },
        options(logCollect: boolean, debugpPrint: boolean, printArgs: boolean): SqlExecuteOption {
            return {
                mainDbPath: "main.db",
                additionalDbPaths: [],

                statements: [
                    {
                        sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
                    },
                    {
                        sql: "select * from test"
                    }
                ],
                lockmode: "shared",
                lockTimeout: 0,
                progressSize: 10000,
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs
            };
        }
    },
    {
        buttonTitle:
            "select all test - alt.db (shared lock, can use on long running selects in multiple tabs)",
        instance: sqliteWorkerClientInstance01,
        getClassName(isActive: boolean) {
            return `p-1 bg-green-600 m-1 ${isActive ? "bg-green-600/50" : ""}`;
        },
        options(logCollect: boolean, debugpPrint: boolean, printArgs: boolean): SqlExecuteOption {
            return {
                mainDbPath: "alt.db",
                additionalDbPaths: [],

                statements: [
                    {
                        sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
                    },
                    {
                        sql: "select * from test"
                    }
                ],
                lockmode: "shared",
                lockTimeout: 0,
                progressSize: 10000,
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs
            };
        }
    },
    {
        buttonTitle: "delete all test in alt.db (attached) (exclusive lock)",
        instance: sqliteWorkerClientInstance01,
        getClassName(isActive: boolean) {
            return `p-1 bg-red-600 m-1 ${isActive ? "bg-red-600/50" : ""}`;
        },
        options(logCollect: boolean, debugpPrint: boolean, printArgs: boolean): SqlExecuteOption {
            return {
                mainDbPath: "",
                additionalDbPaths: ["alt.db"],
                statements: [
                    {
                        sql: "ATTACH DATABASE 'alt.db' AS ALT;"
                    },
                    {
                        sql: "CREATE TABLE IF NOT EXISTS ALT.test (id INTEGER PRIMARY KEY, name TEXT);"
                    },
                    {
                        sql: "delete from ALT.test"
                    }
                ],
                lockmode: "exclusive",
                lockTimeout: 0,
                progressSize: 10000,
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs
            };
        }
    },
    {
        buttonTitle:
            "Insert 2000k rows into main.ds (long running, you can kill, or use other tab to select from alt) (exclusive lock)",
        instance: sqliteWorkerClientInstance01,
        getClassName(isActive: boolean) {
            return `p-1 bg-indigo-500 m-1 ${isActive ? "bg-indigo-500/50" : ""}`;
        },
        options(logCollect: boolean, debugpPrint: boolean, printArgs: boolean): SqlExecuteOption {
            return {
                mainDbPath: "main.db",
                additionalDbPaths: [],
                statements: [
                    {
                        sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
                    },
                    {
                        sql: "INSERT INTO test (name) VALUES (?)",
                        binding: Array.from(Array(2_000_000)).map((_, i) => [
                            `Hello from custom (ALT)VFS:${i}`
                        ])
                    }
                ],
                lockmode: "exclusive",
                lockTimeout: 0,
                progressSize: 10000,
                collectLog: logCollect,
                debugPrint: debugpPrint,
                printInputOptions: printArgs
            };
        }
    }
];
