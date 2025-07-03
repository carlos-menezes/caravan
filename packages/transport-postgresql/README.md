# `@caravan-logger/transport-postgresql`

![NPM Last Update](https://img.shields.io/npm/v/@caravan-logger/transport-postgresql) ![NPM Last Update](https://img.shields.io/npm/last-update/@caravan-logger/transport-postgresql) ![NPM Last Update](https://img.shields.io/npm/l/@caravan-logger/transport-postgresql)

A transport for logging to PostgreSQL.

```txt
 log_id | level |     message     | hostname  | process_id |            time            |        data
--------+-------+-----------------+-----------+------------+----------------------------+--------------------
      1 | INFO  | Info message    | wardstone |      18293 | 2025-07-03 18:55:54.045+00 | {"tech":"caravan"}
      2 | ERROR | Error message   | wardstone |      18293 | 2025-07-03 18:55:54.046+00 | {"tech":"caravan"}
      3 | WARN  | Warning message | wardstone |      18293 | 2025-07-03 18:55:54.046+00 | {"tech":"caravan"}
      4 | FATAL | Fatal message   | wardstone |      18293 | 2025-07-03 18:55:54.047+00 | {"tech":"caravan"}
(4 rows)
```

## Installation

```bash
pnpm add @caravan-logger/transport-postgresql
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { PostgreSQLTransport } from "@caravan-logger/transport-postgresql";

const postgreSQLTransport = new PostgreSQLTransport({
  level: "INFO",
  options: {
    pool: new Pool({
      host: "localhost",
      port: 5432,
      user: "caravan",
      password: "***",
      database: "caravan",
    }),
    table: "logs", // Can be ommited, default value is `logs`
  },
});

// Make sure table exists before attempting to insert logs
await postgreSQLTransport.init();

const logger = new Logger({
  level: "INFO",
  transports: [
    postgreSQLTransport,
  ],
});
```
