const workers = [];
let ready = 0;

for (let i = 0; i < 5; i++) {
  const worker = new Worker(new URL("./worker.js", import.meta.url), {
    type: "module",
  });

  workers.push(worker);

  function doWork() {
    console.log("batch work starting");
    for (let i = 0; i < 5; i++) {
      const w = workers[i];

      w.postMessage("DB" + i);
    }
  }

  let stop = false;

  worker.onmessage = function (msg) {
    if (msg.data === "ERROR") {
      document.body.innerHTML = "open console";
      stop = true;
    }

    if (stop) {
      return;
    }

    if (msg.data === "READY") {
      ready++;
      if (ready === 5) {
        // every worker ready, lets call em
        ready = 0;
        doWork();
      }
    }
  };
}
