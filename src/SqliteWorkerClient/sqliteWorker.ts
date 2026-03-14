import sqlite3InitModule, { type Database, type Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { LogCollector } from "./LogCollector";
import { type FileMap, SyncOpfsVfs } from "./SyncOpfsVfs";
import type {
    ProgressCallback,
    SqlExecuteOption,
    SqlWorkerResult,
    WorkerMessageEvent
} from "./types";

/**
 * worker sqliteInstance
 */
let sqlite3: Sqlite3Static | null = null;

// supress internal logs
(globalThis as any).sqlite3ApiConfig = {
    // define any or all of these:
    warn: () => {},
    error: () => {},
    debug: () => {},
    log: () => {}
};

/**
 * helper for creating sync file handle
 * @param fileFullPath
 * @param lockmode
 * @returns
 */
async function createSyncFileHandle(
    fileFullPath: string,
    lockmode: "read-only" | "readwrite",
    logger: LogCollector,
    isJournal = false
) {
    const parts = fileFullPath.split("/");
    let fileName = parts.pop() || "unknown"; // last part is the file name
    fileName = isJournal ? `${fileName}-journal` : fileName;

    try {
        const root = await navigator.storage.getDirectory();
        let currentDir = root;

        for (const part of parts) {
            if (part) {
                // skip empty strings from leading slashes
                currentDir = await currentDir.getDirectoryHandle(part, { create: true });
            }
        }

        logger.log(`filehandled created: ${parts.join("/") + fileName}, lockmode:${lockmode}`);

        const dbFileHandle = await currentDir.getFileHandle(fileName, {
            create: true
        });

        // @ts-expect-error - not supported everywhere/standard
        const syncHandle = await dbFileHandle.createSyncAccessHandle({
            mode: lockmode
        });

        return {
            data: {
                fullpath: parts.join("/") + fileName,
                syncHandle
            }
        };
    } catch (err: any) {
        return {
            data: null,
            err: {
                err,
                msg: `unable to create sync handle:  ${parts.join("/") + fileName}, with lockMode:${lockmode}`
            }
        };
    }
}

/**
 * helper to check if sharedMode is possible
 */
async function testSharedMode() {
    const logger = new LogCollector(0, "init", false, false, [0, 0]);

    try {
        {
            const syncHandleResult = await createSyncFileHandle(
                "sharedModeTest.db",
                "read-only",
                logger
            );
            if (syncHandleResult.err) {
                throw syncHandleResult.err.err;
            }
        }
        {
            const syncHandleResult = await createSyncFileHandle(
                "sharedModeTest.db",
                "read-only",
                logger
            );
            if (syncHandleResult.err) {
                throw syncHandleResult.err.err;
            }
        }
    } catch (_) {
        globalThis.postMessage({
            id: 0,
            type: "SHARED_MODE_DISABLED"
        } as WorkerMessageEvent);
    } finally {
        globalThis.postMessage({
            id: 0,
            type: "SHARED_MODE_ENABLED"
        } as WorkerMessageEvent);
    }
}
testSharedMode(); // not perfect.. top level await cant be use in iffe..

/**
 * worker message handler
 * @param e
 */
globalThis.onmessage = async (e) => {
    const data = e.data as WorkerMessageEvent;
    if (data.type === "EXECUTE") {
        const progressSize = data.options.progressSize;

        const result = await execute(data.options, data.id, data.logtime, (type, no, total) => {
            if (!data.options.progressSize) return;

            if (type === "ROW" && no % progressSize !== 0) {
                return;
            }

            globalThis.postMessage({
                id: data.id,
                result: {
                    type,
                    no,
                    total
                },
                type: "PROGRESS"
            } as WorkerMessageEvent);
        });
        globalThis.postMessage({
            id: data.id,
            result,
            type: "RESULT"
        } as WorkerMessageEvent);
    }
};

/**
 * executor for sql, create instance/vfs and runs sql
 * @param options
 * @returns
 */
async function execute(
    options: SqlExecuteOption,
    id: number,
    logtime: readonly [number, number],
    progressCallback: ProgressCallback
) {
    /**
     * main vars
     */
    const logger = new LogCollector(id, "iWorker", options.collectLog, options.debugPrint, logtime);
    const fileMap: FileMap = new Map();
    const fileHandles = [];
    let db: Database | null = null;
    const lockmode = options.lockmode === "shared" ? "read-only" : "readwrite";
    /**
     * create main db file handle/directories
     */

    let err: any = null;
    const statementResults: unknown[] = [];

    try {
        logger.log("filehandle about to be created");

        /**
         * create main db file handle/directories
         */
        {
            const syncHandleResult = await createSyncFileHandle(
                options.mainDbPath,
                lockmode,
                logger
            );
            if (syncHandleResult.err) {
                throw syncHandleResult.err.err;
            }
            fileMap.set(syncHandleResult.data.fullpath, syncHandleResult.data.syncHandle);
            fileHandles.push(syncHandleResult.data.syncHandle);
        }
        if (lockmode === "readwrite") {
            const syncHandleResult = await createSyncFileHandle(
                options.mainDbPath,
                lockmode,
                logger,
                true
            );
            if (syncHandleResult.err) {
                throw syncHandleResult.err.err;
            }
            fileMap.set(syncHandleResult.data.fullpath, syncHandleResult.data.syncHandle);
            fileHandles.push(syncHandleResult.data.syncHandle);
        }

        /**
         * create aditional db file handle/directories
         */

        for (let i = 0; i < options.additionalDbPaths.length; i++) {
            {
                const syncHandleResult = await createSyncFileHandle(
                    options.additionalDbPaths[i],
                    lockmode,
                    logger
                );
                if (syncHandleResult.err) {
                    throw syncHandleResult.err.err;
                }
                fileMap.set(syncHandleResult.data.fullpath, syncHandleResult.data.syncHandle);
                fileHandles.push(syncHandleResult.data.syncHandle);
            }
            if (lockmode === "readwrite") {
                const syncHandleResult = await createSyncFileHandle(
                    options.additionalDbPaths[i],
                    lockmode,
                    logger,
                    true
                );
                if (syncHandleResult.err) {
                    throw syncHandleResult.err.err;
                }
                fileMap.set(syncHandleResult.data.fullpath, syncHandleResult.data.syncHandle);
                fileHandles.push(syncHandleResult.data.syncHandle);
            }
        }

        /**
         * init sql if needed
         */

        if (!sqlite3) {
            logger.log("sqlite3InitModule() start");
            sqlite3 = await sqlite3InitModule();
            logger.log("sqlite3InitModule() done");
        }

        /**
         * register SyncOpfsVfs VFS
         */

        logger.log("new SyncOpfsVfs start");

        const vfs = new SyncOpfsVfs(fileMap);
        vfs.register(sqlite3);

        logger.log("new SyncOpfsVfs done");

        /**
         * Create DB
         */

        logger.log("new sqlite3.oo1.DB start");

        db = new sqlite3.oo1.DB({
            filename: options.mainDbPath,
            flags: "rwc",
            vfs: vfs.name
        });

        logger.log("new sqlite3.oo1.DB done");

        /**
         * begin sql work
         */

        if (lockmode === "readwrite") {
            db.exec("pragma locking_mode=exclusive");
            db.exec("pragma journal_mode = TRUNCATE");
            db.exec("BEGIN TRANSACTION");
        }

        for (let i = 0; i < options.statements.length; i++) {
            const statementResult: any[] = [];

            const statement = options.statements[i];
            const binding = statement.binding || [];
            let rowno = 0;

            logger.log(
                `Statement start ${i.toString().padStart(3, "0")} - ${statement.useStatementInLog === false ? "" : statement.sql}`
            );
            logger.log(`Statement bindings: ${binding.length}`);
            if (binding.length > 1) {
                const stmt = db.prepare(statement.sql);
                binding.forEach((v) => {
                    if (Array.isArray(v)) {
                        v.forEach((vv) => {
                            stmt.bind(vv);
                        });
                        if (statement.collect) {
                            stmt.step();
                            statementResult.push(stmt.get([]));
                        }
                        progressCallback("ROW", rowno, null);
                        rowno++;
                    } else {
                        stmt.bind(v);
                        if (statement.collect) {
                            stmt.step();
                            statementResult.push(stmt.get([]));
                        }
                        progressCallback("ROW", rowno, null);
                        rowno++;
                    }

                    stmt.stepReset();
                });

                stmt.finalize();
            } else {
                db.exec({
                    sql: statement.sql,
                    bind: binding[0] || null,
                    returnValue: "resultRows",
                    callback: (row) => {
                        statementResult.push(row);
                        progressCallback("ROW", rowno, null);
                        rowno++;
                    }
                });
            }

            progressCallback("STATEMENT", i, options.statements.length);

            statementResults.push(statementResult);

            logger.log(`Statement done  ${i.toString().padStart(3, "0")}`);
        }
        if (lockmode === "readwrite") {
            logger.log(`db commit start`);
            db.exec("COMMIT");
            logger.log(`db commit done`);
        }
        logger.log(`db close start`);
        db.close();
        logger.log(`db close done`);
    } catch (e) {
        logger.log("error occured");
        if (db) {
            if (lockmode === "readwrite") {
                db.exec("ROLLBACK");
            }
            db.close();
        }
        /* simple for now */
        err = { err: e, msg: "WORKER_ERR" };
    }

    /**
     * cleanup handles
     */

    logger.log("cleanup file handles start");
    for (let i = 0; i < fileHandles.length; i++) {
        if (lockmode === "readwrite") {
            fileHandles[i].flush();
        }
        fileHandles[i].close();
    }

    logger.log("cleanup file handles done - sending data");

    const loggerResult = logger.getResult();

    return {
        data: err ? null : statementResults,
        logs: loggerResult.logs,
        transferedLogtime: logger.transferAbsoluteLogTimes(),
        err,
        execTimeWorker: loggerResult.executeTime,
        execTime: 0
    } as SqlWorkerResult;
}
