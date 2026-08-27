# @caravan-logger/transport-sqlite

A [Caravan](../../README.md) transport that inserts log records as rows into
a SQLite database using [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3).

## Install

```sh
pnpm add @caravan-logger/transport-sqlite better-sqlite3
```

## Usage

```ts
import Database from "better-sqlite3";
import { createLogger } from "@caravan-logger/logger";
import { createSqliteTransport } from "@caravan-logger/transport-sqlite";

const db = new Database("app.db");

const logger = createLogger("app", {
  transports: [createSqliteTransport({ db })],
});

logger.info("Hello, world!", { context: { user: "Alice" } });
logger.info("Hello, world!");
await logger.flush();
```

Querying the database will show the records inserted by the transport:

| id  | level | time          | message         | context                      |
| --- | ----- | ------------- | --------------- | ---------------------------- |
| boo | INFO  | 1787849349827 | "Hello, world!" | {"context":{"user":"Alice"}} |
| boo | INFO  | 1787849349827 | "Hello, world!" | NULL                         |

## Schema

On creation, the transport runs `CREATE TABLE IF NOT EXISTS` for the
configured table (`logs` by default) with the following columns:

| Column    | Type    | Description                               |
| --------- | ------- | ----------------------------------------- |
| `id`      | TEXT    | The logger's `id`.                        |
| `level`   | TEXT    | The record's level.                       |
| `time`    | INTEGER | `Date.now()` when the record was created. |
| `message` | TEXT    | The record's message.                     |
| `context` | TEXT    | JSON-serialized context, or `NULL`.       |

## Options

| Option             | Type                                               | Default                                 | Description                                                                                  |
| ------------------ | -------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `db`               | `Database.Database`                                | —                                       | An already-constructed `better-sqlite3` database (required).                                 |
| `table`            | `string`                                           | `"logs"`                                | Table log records are inserted into. Must be a valid SQL identifier.                         |
| `serializeContext` | `(context: object \| undefined) => string \| null` | `JSON.stringify`, or `null` when absent | Serializes a record's context to the stored `context` column.                                |
| `batchSize`        | `number`                                           | `1`                                     | Number of records buffered before a batch insert runs.                                       |
| `flushInterval`    | `number`                                           | —                                       | Interval, in milliseconds, at which buffered records are inserted regardless of `batchSize`. |
| `level`            | `TDefaultLevels`                                   | inherits the logger's level             | Drops records below this level before `write()` runs.                                        |
