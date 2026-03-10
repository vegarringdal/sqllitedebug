import { LogCollector } from "./LogCollector";
import SqliteWorker from "./sqliteWorker?worker";
import type {
    ProgressCallback,
    resolveFN,
    SqlExecuteOption,
    SqlWorkerResult,
    WorkerMessageEvent
} from "./types";

/**
 * each client have own worker..
 * all depends how you need to call it
 */
export class SqliteWorkerClient {
    #workerThread: Worker | null = null;
    #filePromiseLocks: Set<resolveFN> = new Set();
    #internalId = 0;
    #responses: Map<number, any> = new Map();
    #progressCallback: Map<number, ProgressCallback> = new Map();

    #getNextId() {
        this.#internalId++;
        if (this.#internalId > 1_000_000) {
            this.#internalId = 0;
        }
        return this.#internalId;
    }

    #getWorker() {
        // dont create if its not connected
        if (!this.#workerThread) {
            this.#workerThread = new SqliteWorker();
            this.#workerThread.onmessage = (e) => {
                const data = e.data as WorkerMessageEvent;
                if (data.type === "RESULT") {
                    const r = this.#responses.get(data.id);

                    //cleanup
                    this.#responses.delete(data.id);
                    this.#progressCallback.delete(data.id);

                    if (r) {
                        r(data.result);
                    } else {
                        console.error("dont know who to send result to", data);
                    }

                    return;
                }

                if (data.type === "PROGRESS") {
                    const r = this.#progressCallback.get(data.id);
                    if (r) {
                        r(data.result.type, data.result.no, data.result.total);
                    }
                    return;
                }

                console.error("unknown response", data);
            };
        }
        return this.#workerThread;
    }

    /**
     * this will kill all sql running in worker..
     */
    killWorkerThread() {
        // terminate and cleanup/end
        this.#workerThread?.terminate();
        this.#workerThread = null;
        this.#filePromiseLocks.forEach((e) => {
            e(null);
        });
        this.#filePromiseLocks.clear();
        this.#responses.forEach((r) => {
            r({ data: null, err: { err: null, msg: "worker killed" } });
        });
        this.#responses.clear();
        this.#internalId = 0;
        this.#progressCallback.clear();
    }

    #execute<T>(
        options: SqlExecuteOption,
        id: number,
        logtime: readonly [number, number],
        progressCallback?: ProgressCallback
    ): Promise<T> {
        return new Promise((r) => {
            const worker = this.#getWorker();

            this.#responses.set(id, r);

            // configure progress

            if (progressCallback && options.progressSize) {
                this.#progressCallback.set(id, progressCallback);
            } else {
                // disable it, nothing to send back too
                options.progressSize = 0;
            }

            worker?.postMessage({
                id,
                logtime,
                options,
                type: "EXECUTE"
            });
        });
    }

    constructor() {
        // init
        this.#getWorker();
    }

    postChannel(channel: string, message: any) {
        const c = new BroadcastChannel(channel);
        c.postMessage(message);
    }

    async execute(options: SqlExecuteOption, progressCallback?: ProgressCallback) {
        const p = performance.now();
        const id = this.#getNextId();
        const log_before_work = new LogCollector(
            id,
            "bWorker",
            options.collectLog,
            options.debugPrint,
            [performance.timeOrigin + p, performance.timeOrigin + p]
        );
        let log_after_work: LogCollector | null = null;
        const files = new Set<string>();
        files.add(options.mainDbPath);
        options.additionalDbPaths.map((e) => files.add(e));

        const resolves: resolveFN[] = [];
        const locks: Promise<any>[] = [];
        const filesInUse: string[] = [];
        const lockTimeout = options.lockTimeout || 0;
        const lockMode = options.lockmode || "exclusive";

        let finalResult = {} as SqlWorkerResult;

        const lockOptions = {
            ifAvailable: lockTimeout === 0,
            mode: lockMode || "exclusive"
        } as LockOptions;
        if (lockTimeout > 0) {
            const controller = new AbortController();
            setTimeout(() => controller?.abort(), lockTimeout);
            lockOptions.signal = controller.signal;
        }

        Array.from(files).forEach((e) => {
            log_before_work.log(`Locking: ${e}`);
            locks.push(
                navigator.locks.request(e, lockOptions, (lock) => {
                    return new Promise(async (r) => {
                        if (!lock) {
                            log_before_work.log(`File in use: ${e}`);
                            filesInUse.push(e);
                        }
                        log_before_work.log(`Lock ok: ${e}`);
                        // we need to release them later, calling resolve unlocks the file
                        resolves.push(r);
                        this.#filePromiseLocks.add(r); // so we have ref to them if we need to terminate worker... we also need to unlock locked files

                        if (resolves.length === files.size) {
                            if (filesInUse.length === 0) {
                                log_before_work.log(`All locks aquired, calling worker`);
                                finalResult = await this.#execute(
                                    options,
                                    id,
                                    log_before_work.transferAbsoluteLogTimes(),
                                    progressCallback
                                );
                            } else {
                                log_before_work.log(`Locking failed`);
                            }
                            const logimer = finalResult.transferedLogtime || [
                                performance.timeOrigin + p,
                                performance.timeOrigin + p
                            ];
                            log_after_work = new LogCollector(
                                id,
                                "aWorker",
                                options.collectLog,
                                options.debugPrint,
                                logimer
                            );
                            log_after_work.log(`unlocking`);
                            resolves.forEach((e) => {
                                // release/cleanup class refs
                                e(null);
                                this.#filePromiseLocks.delete(e);
                            });
                            log_after_work.log(`unlocking done`);
                        }
                    });
                })
            );
        });

        await Promise.allSettled(locks);

        // add total time

        if (filesInUse.length) {
            finalResult.data = null;
            finalResult.err = {
                err: null,
                msg: `Files in use: ${filesInUse.join(", ")}`
            };
        }
        if (log_after_work) {
            (log_after_work as LogCollector).log(`done`);
        }

        finalResult.logs = log_before_work
            .getResult()
            .logs.concat(
                finalResult.logs.concat(
                    (log_after_work && (log_after_work as LogCollector).getResult().logs) || []
                )
            );

        finalResult.execTime = performance.now() - p;

        return finalResult;
    }
}
