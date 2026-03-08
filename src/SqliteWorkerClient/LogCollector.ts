export class LogCollector {
    #logs: string[] = [];
    #startTime: number = 0;
    #enabled: boolean;
    #debugPrint: boolean;
    #id: number;

    constructor(id: number, enabled: boolean = false, debugPrint: boolean = false) {
        this.#id = id;
        this.#startTime = performance.now();
        this.#enabled = enabled;
        this.#debugPrint = debugPrint;
    }

    log(msg: string) {
        if (!this.#enabled && !this.#debugPrint) {
            return;
        }

        const t = `${msg}`;
        const log = `${(performance.now() - this.#startTime).toFixed(0).padStart(4, "0")} ms  - ${t}`;
        if (this.#enabled) {
            this.#logs.push(log);
        }

        if (this.#debugPrint) {
            console.log(this.#id, log);
        }
    }

    getResult() {
        return {
            logs: this.#logs,
            startTime: this.#startTime,
            executeTime: performance.now() - this.#startTime
        };
    }
}
