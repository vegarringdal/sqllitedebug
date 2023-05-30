import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

let sqliteRef = null;

sqlite3InitModule({
  print: function (e) {
    console.log(e);
  },
  printErr: function (e) {
    console.error(e);
  },
}).then((sqlite) => {
  sqliteRef = sqlite;
  console.log("Done initializing");
  self.postMessage("READY");
});

self.onmessage = function (msg) {
  let db;
  try {
    db = new sqliteRef.oo1.OpfsDb(`/DB/${msg.data}.sqlite3`);

    db.exec(
      `
    BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS DATA(ID, FULLNAME, PARENT_ID, X_MIN, Y_MIN, Z_MIN, X_MAX, Y_MAX, Z_MAX, INDEX_NAME, GROUP_NAME);
    DROP INDEX IF EXISTS ID_INDEX;
    DROP INDEX IF EXISTS PARENT_ID_INDEX;
    `
    );

    const stmt = db.prepare(
      `INSERT INTO DATA(ID, FULLNAME, PARENT_ID, X_MIN, Y_MIN, Z_MIN, X_MAX, Y_MAX, Z_MAX, INDEX_NAME, GROUP_NAME) VALUES (?,?,?,?,?,?,?,?,?,?,?);
     
    `
    );

    for (let i = 0; i < 10000; i++) {
      stmt.bind([
        `id${Math.random()}`,
        `f${Math.random()}`,
        `p${Math.random()}`,
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        `g${Math.random()}`,
      ]);

      stmt.stepReset();
    }

    stmt.finalize();

    db.exec(
      `
    CREATE INDEX IF NOT EXISTS ID_INDEX ON DATA(ID);
    CREATE INDEX IF NOT EXISTS PARENT_ID_INDEX ON DATA(PARENT_ID);
    COMMIT;
    `
    );
  } catch (e) {
    console.log(e);
    self.postMessage("ERROR");
  } finally {
    db.close();
    self.postMessage("READY");
  }
};
