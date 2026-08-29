# @caravan-logger/transport-datadog

## 1.0.3

### Patch Changes

- Updated dependencies [[`ac6edf0`](https://github.com/carlos-menezes/caravan/commit/ac6edf0c016467069037bbbde3c1d50d03adce11)]:
  - @caravan-logger/logger@1.1.0

## 1.0.2

### Patch Changes

- Move `@caravan-logger/logger` from `devDependencies` to `dependencies`. Each transport package imports and calls `createTransport` from it at runtime, so it must be installed for consumers, not just during development. Under isolated `node_modules` installs (pnpm strict mode), the missing dependency prevented the package's own type declarations from resolving, causing every exported type to silently degrade to `any`.

## 1.0.1

### Patch Changes

- [`6858967`](https://github.com/carlos-menezes/caravan/commit/6858967006c584d0c2a63f536ef48e34b0e02a9c) Thanks [@carlos-menezes](https://github.com/carlos-menezes)! - chore: fix distributed files

## 1.0.0

### Major Changes

- [`53665d6`](https://github.com/carlos-menezes/caravan/commit/53665d6f01ed027424ed9795881867098d374afc) Thanks [@carlos-menezes](https://github.com/carlos-menezes)! - The first stable release of Caravan: a small, typed logging library with a core logger and four
  transport packages. This is a ground-up rewrite, so every package is released as a major version.

  ### `@caravan-logger/logger`
  - `createLogger(id, options)` creates a logger with an `id`, a `level`, `transports`, `context` and
    `middleware`, and exposes one log method per level (`trace`, `debug`, `info`, `warn`, `error`,
    `fatal`). Each method accepts a message, a context object, or both.
  - Levels are `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR` and `FATAL`, ordered from least to most
    severe. A logger's `level` (default `INFO`) determines which records are dispatched to
    transports.
  - Child loggers can be created via `inherit: { from: parentLogger }`, optionally picking which of
    the parent's `context`, `transports` and `middleware` to keep (all are kept by default). Context
    is merged, not overwritten, so a child logger can extend but not lose its parent's context.
  - `middleware` runs on every record, in order, before it reaches transports. A middleware function
    can transform a record or drop it entirely by returning `undefined`. Middleware is inherited by
    child loggers.
  - `logger.flush()` awaits all pending writes across every transport, surfacing the first write
    error thrown by any of them.
  - `createTransport({ write, flush? }, configuration?)` is the primitive used to build custom
    transports. It tracks pending writes so `flush()` can await them, enforces a per-transport
    `level` cutoff, and rethrows the first write error on `flush()`.

  ### `@caravan-logger/transport-stream`
  - `createStreamTransport({ stream, format?, eol?, level? })` writes each record as its own line to
    a Node.js `Writable` or a web `WritableStream<string>`.
  - Records are serialized with `JSON.stringify` by default, or with a custom `format` function.
    `eol` controls the line ending (`"lf"` by default, or `"crlf"`).

  ### `@caravan-logger/transport-datadog`
  - `createDatadogTransport({ apiKey, site?, url?, service?, ddsource?, hostname?, tags?, format?, batchSize?, flushInterval?, fetch?, level? })`
    sends records to Datadog's Logs intake API.
  - `site` selects the Datadog intake domain (`datadoghq.com`, `datadoghq.eu`, `us3.datadoghq.com`,
    `us5.datadoghq.com`, `ap1.datadoghq.com`, `ap2.datadoghq.com`, `ddog-gov.com`, or a custom
    string), or `url` can override the intake endpoint entirely.
  - `tags` accepts either a `"key:value"` string array or a key/value record and is sent as
    `ddtags`. Records are batched according to `batchSize` (default `1`, i.e. sent immediately) and/or
    flushed periodically via `flushInterval`.
  - `format` overrides the default record-to-Datadog-entry mapping, and `fetch` overrides the fetch
    implementation used to call the intake API (useful for testing or custom networking).

  ### `@caravan-logger/transport-better-stack`
  - `createBetterStackTransport({ sourceToken, endpoint, format?, batchSize?, flushInterval?, fetch?, level? })`
    sends records to Better Stack's Logs ingesting API using a per-source `endpoint` and
    `sourceToken`.
  - Supports the same batching (`batchSize`, `flushInterval`), custom `format` and `fetch` override
    options as the Datadog transport.

  ### `@caravan-logger/transport-sqlite`
  - `createSqliteTransport({ db, table?, serializeContext?, batchSize?, flushInterval?, level? })`
    inserts records as rows into a `better-sqlite3` database, using an already-constructed `db`
    instance whose lifecycle the transport does not manage.
  - Creates the destination table (`logs` by default, configurable via `table`) if it doesn't already
    exist, with `id`, `level`, `time`, `message` and `context` columns. Table names are validated
    against a strict identifier pattern to guard against SQL injection.
  - `context` is serialized to the `context` column with `JSON.stringify` by default, or a custom
    `serializeContext` function. Inserts are batched in a single transaction according to `batchSize`
    and/or `flushInterval`.
