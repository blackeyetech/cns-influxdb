import { CNInfluxDB } from "./main";

let db = new CNInfluxDB("test", {
  influxUrl: "http://localhost:8086",
});

(async () => {
  await db.init();
  await db.query({ db: "test", q: "CREATE DATABASE newdb", get: false });
  await db.insert({
    db: "newdb",
    measurement: "temp",
    points: [
      {
        values: { t1: 36000, ok: true, where: "here" },
        tags: { sensor: "S1", eui: "12121212" },
        time: Date.now(),
      },
    ],
  });
  let res = await db.query({ db: "newdb", q: "SELECT * FROM temp", get: true });

  console.log("%j", res.data);
})();
