export type ProgressCallback = (
    type: "STATEMENT" | "ROW",
    no: number,
    total: number | null
) => void;

export type SqlExecuteOption = {
    mainDbPath: string;
    /**
     * for attach db if needed, or you just want to lock
     */
    additionalDbPaths: string[];
    /**
     * all statements are wrapped in 1 common
     * -----------------------------------
     *      db.exec("pragma locking_mode=exclusive;");
     *      db.exec("BEGIN TRANSACTION");
     *          // all statements
     *      db.exec("COMMIT"); or  db.exec("ROLLBACK"); if it fails...
     */
    statements: Statement[];
    /**
     * how long to wait until you quick trying to lock..
     * useful if you do a lot of small operations, and want it to try up to 500ms..
     */
    lockTimeout: number;
    /**
     * mode for web-lock/filehandle
     * PS! not all browsers support read-only mode..
     * use shared for read only mode
     */
    lockmode: "shared" | "exclusive";
    /**
     * 0 = off
     * will only show if type ROW (rowno % progressSize !== 0)
     * PS! this can slow it down a lot..
     */
    progressSize: number;

    /**
     * print to console in worker...
     */
    debugPrint: boolean; // default = false
    /**
     * print to conosle, input to printSqliteWorkerClient helper
     */
    printInputOptions: boolean; // default = false
    /**
     * for collecting/debug, will print if printSqliteWorkerClient helper is used
     */
    collectLog: boolean; // default = false
};

export type Statement = {
    /**
     * name you can use for something in gui
     */
    name?: string;
    /**
     * DEFAULT = true
     * if you want to set SQL to statement
     */
    useStatementInLog?: boolean;
    /**
     * sql to run
     */
    sql: string;
    /**
     * if more then one row, we use:
     * -----------------------------------
     *      const stmt = db.prepare(statement.sql);
     *          binding.forEach((v) => {
     *          stmt.bind(v);
     *          stmt.stepReset();
     *      });
     *      stmt.finalize();
     *
     *
     * if just one row: (if you want to collect results..)
     * -----------------------------------
     *          db.exec({
     *               sql: statement.sql,
     *               bind: binding[0] || null,
     *               returnValue: "resultRows",
     *               callback: (row)=>...
     *           });
     */
    binding?: (string | number)[][];
    /**
     * if you need to collect results
     */
    collect?: boolean;
};

export type WorkerMessageEvent =
    | {
          id: number;
          options: SqlExecuteOption;
          logtime: readonly [number, number];
          type: "EXECUTE";
      }
    | {
          id: number;
          result: SqlWorkerResult;
          type: "RESULT";
      }
    | {
          id: number;
          type: "SHARED_MODE_DISABLED";
      }
    | {
          id: number;
          type: "SHARED_MODE_ENABLED";
      }
    | {
          id: number;
          result: {
              type: "STATEMENT" | "ROW";
              no: number;
              total: number | null;
          };
          type: "PROGRESS";
      };

export type resolveFN = (value: unknown) => void;

export type SqlWorkerResult = {
    data: unknown[] | null;
    logs: string[];
    err: null | { err: any; msg: string };
    // internal only atm
    transferedLogtime: readonly [number, number];
    execTimeWorker: number;
    execTime: number;
};
export interface OpenFile {
    name: string;
    handle?: FileSystemSyncAccessHandle;
    inMemory?: Uint8Array;
}
