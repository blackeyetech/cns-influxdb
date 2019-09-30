// imports here
import CNShell from "cn-shell";
import axios, { AxiosResponse } from "axios";
import querystring from "querystring";

// Interfaces here
export interface DBOptions {
  influxUrl: string;
  username?: string;
  password?: string;
}

export interface Point {
  values: { [name: string]: string | number | boolean };
  tags: { [name: string]: string };
  time?: number;
}

export interface InsertOptions {
  db: string;
  precision?: string;
  measurement: string;
  points: Point[];
  rp?: string;
}

export interface InsertParameters {
  db: string;
  precision: string;
  u?: string;
  p?: string;
  rp?: string;
}

export interface QueryOptions {
  db: string;
  q: string;
  get: boolean;
  epoch?: string;
  chunked?: boolean;
  pretty?: boolean;
}

export interface QueryParameters {
  db: string;
  q?: string;
  epoch?: string;
  chunked?: boolean;
  u?: string;
  p?: string;
  pretty?: boolean;
}

// InfluxDB consts here
const PING_INFLUX_DB = "ping";
const WRITE_INFLUX_DB = "write";
const QUERY_INFLUX_DB = "query";

// Class CNInfluxDB here
export default class CNInfluxDB extends CNShell {
  // Properties here
  private _influxUrl: string;
  private _username?: string;
  private _password?: string;

  // private _dbList: string[];

  // Constructor here
  constructor(name: string, options: DBOptions) {
    // Make the name of the db the name
    super(name);

    this._influxUrl = options.influxUrl;
    this._username = options.username;
    this._password = options.password;
  }

  // Methods here
  async start(): Promise<boolean> {
    this.info("Starting ...");

    return new Promise(resolve => {
      this.isServerReady(resolve);
    });
  }

  private isServerReady(resolve: (ready: boolean) => void): void {
    // Lets check if we can ping the DB
    axios
      .get(`${this._influxUrl}/${PING_INFLUX_DB}`)
      .then(() => {
        this.info("InfluxDB ready");
        this.info("Started!");
        resolve(true);
      })
      .catch(() => {
        this.info("trying again ...");
        setTimeout(() => {
          this.isServerReady(resolve);
        }, 5000);
      });
  }

  async stop(): Promise<void> {
    this.info("Stopped!");
  }

  async healthCheck(): Promise<boolean> {
    let status = true;

    await axios.get(`${this._influxUrl}/${PING_INFLUX_DB}`).catch(() => {
      status = false;
    });

    return status;
  }

  async insert(opts: InsertOptions): Promise<void> {
    let params: InsertParameters = { db: opts.db, precision: "ms" };
    if (this._username !== undefined && this._password !== undefined) {
      params.u = this._username;
      params.p = this._password;
    }
    if (opts.rp !== undefined) {
      params.rp = opts.rp;
    }
    if (opts.precision !== undefined) {
      params.precision = opts.precision;
    }

    let qs = querystring.stringify(<any>params);
    let data = "";

    for (let i in opts.points) {
      let point = opts.points[i];

      data += opts.measurement;
      if (point.tags !== undefined) {
        for (let tag in point.tags) {
          data += `,${tag}=${point.tags[tag]}`;
        }
      }

      if (point.values !== undefined) {
        data += " ";

        let first = true;

        for (let val in point.values) {
          if (first) {
            first = false;
          } else {
            data += ",";
          }

          data += `${val}=`;
          switch (typeof point.values[val]) {
            case "string":
              data += `"${point.values[val]}"`;
              break;
            case "number":
              data += `${point.values[val]}`;
              break;
            case "boolean":
              data += point.values[val] ? "true" : "false";
              break;
          }
        }

        if (point.time !== undefined) {
          data += ` ${point.time}`;
        }

        data += "\n";
      }
    }

    await axios({
      url: `${this._influxUrl}/${WRITE_INFLUX_DB}?${qs}`,
      method: "post",
      data,
    }).catch(e => {
      this.error("Insert Error: %s", e);
    });
  }

  async query(opts: QueryOptions): Promise<any | void> {
    let params: QueryParameters = { db: opts.db };
    if (this._username !== undefined && this._password !== undefined) {
      params.u = this._username;
      params.p = this._password;
    }
    if (opts.chunked !== undefined) {
      params.chunked = opts.chunked;
    }
    if (opts.pretty !== undefined) {
      params.pretty = opts.pretty;
    }
    if (opts.epoch !== undefined) {
      params.epoch = opts.epoch;
    }

    let data = "";

    if (opts.get) {
      params.q = opts.q;
    } else {
      data = querystring.stringify(<any>{ q: opts.q });
    }

    let qs = querystring.stringify(<any>params);

    let results = await axios({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // required to send query in POST body
        Accept: "application/json",
      },
      url: `${this._influxUrl}/${QUERY_INFLUX_DB}?${qs}`,
      method: opts.get ? "get" : "post",
      data,
    }).catch(e => {
      this.error("Query Error: %s", e);
    });

    if (results === undefined) {
      return;
    }

    return results.data;
  }
}
