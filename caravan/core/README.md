# @caravan-logger/logger

![NPM Version](https://img.shields.io/npm/v/%40caravan-logger%2Flogger) ![NPM Downloads](https://img.shields.io/npm/dw/%40caravan-logger%logger?style=flat-square) ![npm bundle size](https://img.shields.io/bundlephobia/min/%40caravan-logger%logger?style=flat-square)

The core of [Caravan](../../README.md). A small, typed logger that handles
levels, context and middleware, and dispatches records to pluggable
transports.

## Install

```sh
pnpm add @caravan-logger/logger
```

## Usage

```ts
import { createLogger } from "@caravan-logger/logger";
import { createStreamTransport } from "@caravan-logger/transport-stream";

const logger = createLogger("app", {
  level: "INFO",
  transports: [createStreamTransport({ stream: process.stdout })],
});

logger.info("server started", { port: 3000 });
logger.warn({ port: 3000, retrying: true });
logger.error("failed to bind port", { port: 3000 });

await logger.flush();
```

## Log levels

Levels, ordered from least to most severe: `TRACE`, `DEBUG`, `INFO`, `WARN`,
`ERROR`, `FATAL`. A logger has one log method per level (`trace`, `debug`,
`info`, `warn`, `error`, `fatal`), each accepting a message, a context object,
or both. A logger's `level` sets the minimum severity a record must meet to
be dispatched to its transports; records below it are dropped.

## Context and child loggers

Context passed to `createLogger` is merged into every record the logger
writes. Child loggers created with `inherit` pick up the parent's level,
transports, context and middleware, and can extend the context further
without mutating the parent. `id` is optional when inheriting and defaults
to the parent's `id`; pass one explicitly to give the child its own.

```ts
const requestLogger = createLogger({
  inherit: { from: logger },
  context: { requestId: "abc-123" },
});

requestLogger.warn("slow response", { durationMs: 820 });
```

Each part of the inheritance can be opted out of individually:

```ts
const detachedLogger = createLogger("worker", {
  inherit: { from: logger, context: false, transports: false, middleware: false },
});
```

## Middleware

Middleware runs on every record, in order, before it reaches transports. It
can transform a record or drop it entirely by returning `undefined`.

```ts
const logger = createLogger("app", {
  transports: [createStreamTransport({ stream: process.stdout })],
  middleware: [
    (record) => (record.context?.password ? undefined : record), // drop sensitive records
  ],
});
```

## Flushing

`flush()` awaits all pending writes across a logger's transports, and
rethrows the first write error encountered, if any. Call it before your
process exits to make sure buffered records are written.

```ts
await logger.flush();
```

## Options

| Option       | Type                                           | Default                         | Description                                                                |
| ------------ | ---------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------- |
| `inherit`    | `{ from, context?, transports?, middleware? }` | —                               | Derives level, transports, context and/or middleware from a parent logger. |
| `level`      | `TDefaultLevels`                               | `"INFO"`, or the parent's level | Minimum level a record must meet to be sent to transports.                 |
| `transports` | `TTransport[]`                                 | `[]`                            | Destinations records are dispatched to.                                    |
| `context`    | `object`                                       | —                               | Merged into every record this logger writes.                               |
| `middleware` | `TLogMiddleware[]`                             | `[]`                            | Runs on every record, in order, before it reaches transports.              |

## Writing a transport

Transports are created with `createTransport`, which tracks pending writes
so `flush()` can await them and surface write errors.

```ts
import { createTransport, type TCreateTransportBaseConfiguration } from "@caravan-logger/logger";

type TConfiguration = TCreateTransportBaseConfiguration & {
  destination: string;
};

const createMyTransport = (configuration: TConfiguration) =>
  createTransport(
    {
      write: (record) => {
        // send `record` to `configuration.destination`
      },
    },
    configuration,
  );
```

See the existing transport packages
([`transport-stream`](../transport-stream), [`transport-datadog`](../transport-datadog),
[`transport-better-stack`](../transport-better-stack), [`transport-sqlite`](../transport-sqlite))
for complete examples.
