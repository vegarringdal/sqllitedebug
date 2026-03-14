import { useState } from "react";
import "./App.css";
import { twJoin } from "tailwind-merge";
import { printSqliteWorkerClient } from "./SqliteWorkerClient/main";
import { samples } from "./utils/samples";
import { sqliteWorkerClientInstance01 } from "./utils/sqliteWorkerClientInstance";

function App() {
    const [logCollect, setLogCollect] = useState(true);
    const [workerLogPrint, setWorkerLogPrint] = useState(false);
    const [printInputArgs, setPrintInputArgs] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [progessMsg, setProgressMsg] = useState("ready for user action");
    const [errorMsg, setErrorMsg] = useState("");
    const [workerExecTime, setWorkerExecTime] = useState("");
    const [totalExecTime, setTotalExecTime] = useState("");

    return (
        <div className="app flex flex-col bg-gray-900 text-gray-200 h-full w-full text-xs @container">
            <span className="flex m-auto mt-0 mb-0 p-2">
                🚧 Open console to see result/log etc 🚧
            </span>

            <div>
                <label
                    className="flex p-1"
                    onChange={() => {
                        setPrintInputArgs(!printInputArgs);
                    }}
                >
                    <input
                        className="p-1 mr-1"
                        checked={printInputArgs}
                        type="checkbox"
                        onChange={() => {
                            setPrintInputArgs(!printInputArgs);
                        }}
                    ></input>
                    print input arg
                </label>
            </div>

            <div>
                <label
                    className="flex p-1"
                    onChange={() => {
                        setLogCollect(!logCollect);
                        setWorkerLogPrint(!workerLogPrint);
                    }}
                >
                    <input
                        className="p-1 mr-1"
                        checked={logCollect}
                        type="checkbox"
                        onChange={() => {
                            setLogCollect(!logCollect);
                            setWorkerLogPrint(!workerLogPrint);
                        }}
                    ></input>
                    collect log (collects all and prints in end)
                </label>
            </div>
            <div>
                <label
                    className="flex p-1"
                    onChange={() => {
                        setLogCollect(!logCollect);
                        setWorkerLogPrint(!workerLogPrint);
                    }}
                >
                    <input
                        className="p-1 mr-1"
                        checked={workerLogPrint}
                        type="checkbox"
                        onChange={() => {
                            setLogCollect(!logCollect);
                            setWorkerLogPrint(!workerLogPrint);
                        }}
                    ></input>
                    debug log (prints as you hit the step in the worker)
                </label>
            </div>

            <div className="p-2 w-full text-yellow-300">Progress: {progessMsg}</div>
            <div className="p-2 w-full text-red-300">
                Errors: <span hidden={errorMsg === ""}>{errorMsg}</span>
            </div>
            <div className="p-2 w-full text-red-300">workerExecTime: {workerExecTime}</div>
            <div className="p-2 w-full text-red-300">totalExecTime: {totalExecTime}</div>
            <div className="flex flex-col p-3">
                <button
                    type="button"
                    className={twJoin("p-1 bg-yellow-500 m-1")}
                    onClick={async () => {
                        setIsActive(true);
                        setProgressMsg("starting work");
                        setErrorMsg("");

                        sqliteWorkerClientInstance01.killWorkerThread();

                        setIsActive(false);

                        setProgressMsg("ready for user action");
                    }}
                >
                    kill worker
                </button>
            </div>
            {samples.map((e, i) => {
                const args = e.options(logCollect, workerLogPrint, printInputArgs);

                return (
                    <div key={i} className="flex flex-col p-3">
                        <button
                            type="button"
                            disabled={isActive}
                            className={e.getClassName(isActive)}
                            onClick={async () => {
                                console.clear(); // easier to read samples

                                setIsActive(true);
                                setProgressMsg("starting work");
                                setErrorMsg("");

                                const r = await e.instance.execute(args, (type, no, _total) => {
                                    setProgressMsg(`Type:${type.padEnd(10, " ")} ${no}`);
                                });

                                setWorkerExecTime(`${r.execTimeWorker.toFixed(0)}ms`);
                                setTotalExecTime(`${r.execTime.toFixed(0)}ms`);
                                printSqliteWorkerClient(args, r);
                                setIsActive(false);

                                setProgressMsg("ready for user action");
                                if (r.err) {
                                    setErrorMsg(r.err.msg);
                                }
                            }}
                        >
                            {e.buttonTitle}
                        </button>
                        <span className="p-1 text-gray-500 text-">
                            Will lock: {args.mainDbPath} {args.additionalDbPaths.join(", ")},
                            lockmode: {args.lockmode}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default App;
