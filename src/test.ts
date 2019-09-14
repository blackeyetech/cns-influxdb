// import { CNPostgreSqlConn } from "./postgresql-conn";
// import * as pg from "pg";
import { CNInfluxDB } from "./main";

let db = new CNInfluxDB({
  db: "test",
  influxUrl: "http://localhost:8086",
});

(async () => {
  await db.init();
  await db.insert("test3", [
    {
      values: { t1: 36000, ok: true, where: "here" },
      tags: { sensor: "S1", eui: "12121212" },
      time: Date.now(),
    },
  ]);
  let res = await db.query({ q: "SELECT * FROM test3", get: true });

  console.log("%j", res.data);

  await db.query({ q: "CREATE DATABASE newdb", get: false });
})();
