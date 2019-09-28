import CNInfluxDB from "./main";

let db = new CNInfluxDB("test", {
  influxUrl: "http://localhost:8086",
});

(async () => {
  await db.init();
  await db.query({ db: "", q: "CREATE DATABASE newerdb", get: false });
  await db.insert({
    db: "newerdb",
    measurement: "temp",
    points: [
      {
        values: { t1: 36000, ok: true, where: "here" },
        tags: { sensor: "S1", eui: "12121212" },
        time: Date.now(),
      },
    ],
  });
  // let res = await db.query({ db: "newdb", q: "SELECT * FROM temp", get: true });

  // console.log("%j", res.data);
})();
