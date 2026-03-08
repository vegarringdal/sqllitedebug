import type { SqlExecuteOption, SqlWorkerResult } from "./types";

export { SqliteWorkerClient } from "./SqliteWorkerClient";

/**
 * helper for printing input/result/logs
 * @param options
 * @param result
 */
export function printSqliteWorkerClient(options: SqlExecuteOption, result: SqlWorkerResult) {
    if (options.printInputOptions) {
        console.log("InputOptions:\n", options);
    }

    if (result.logs?.length) {
        console.log("Collected logs:\n", `\t${result.logs.join("\n\t")}`);
    }

    result.err ? console.error("Result:\n", result) : console.info("Result:\n", result);
}
