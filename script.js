const workers = [];
let ready = 0;
let batch = 0;
let maxWorkers = 10; // change me to set workers used


for (let i = 0; i < maxWorkers; i++) {
  const worker = new Worker(new URL("./worker.js", import.meta.url), {
    type: "module",
  });

  workers.push(worker);

  function doWork() {
    batch++;

    document.body.innerHTML =
      "please wait - close developer console, starting batch" + batch;

    for (let i = 0; i < workers.length; i++) {
      const w = workers[i];

      w.postMessage("DB" + i);
    }
  }

  let stop = false;

  worker.onmessage = function (msg) {
    if (msg.data === "ERROR") {
      document.body.innerHTML = "open console, failed at batch:" + batch;
      stop = true;
    }

    if (stop) {
      return;
    }

    if (msg.data === "READY") {
      ready++;
      if (ready === workers.length) {
        // every worker ready, lets call em
        ready = 0;
        doWork();
      }
    }
  };
}
