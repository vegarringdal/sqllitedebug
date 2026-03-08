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
     * DEFAULT = false
     * set automatically if progressCallback is defined
     */
    progress?: boolean;
    /**
     * DEFAULT = 1000
     * will only show if (rowno % progressSize === 0)
     */
    progressSize?: number;

    /**
     * print to console in worker...
     */
    debugPrint?: boolean; // default = false
    /**
     * print to conosle, input to printSqliteWorkerClient helper
     */
    printInputOptions: boolean; // default = false
    /**
     * for collecting/debug, will print if printSqliteWorkerClient helper is used
     */
    collectLog?: boolean; // default = false
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
          type: "EXECUTE";
      }
    | {
          id: number;
          result: SqlWorkerResult;
          type: "RESULT";
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
    execTimeWorker: number;
    execTime: number;
};
export interface OpenFile {
    name: string;
    handle?: FileSystemSyncAccessHandle;
    inMemory?: Uint8Array;
}
