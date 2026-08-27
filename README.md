/ˈkærəvæn/

![header](./.github/repo/header.jpg)

A small, typed logging library for JavaScript applications. Caravan gives you a core logger
with levels, context and pluggable transports, plus a set of transport
packages for where the logs actually go.

## Packages

- [`@caravan-logger/logger`](caravan/core): the core logger. Handles levels,
  context inheritance and dispatching records to transports.
- [`@caravan-logger/transport-stream`](caravan/transport-stream): a
  transport that writes log records to a Node.js or web `WritableStream`,
  optionally formatting records before they're written.
- [`@caravan-logger/transport-datadog`](caravan/transport-datadog): a
  transport that sends log records to Datadog's Logs API.
- [`@caravan-logger/transport-better-stack`](caravan/transport-better-stack): a
  transport that sends log records to Better Stack's Logs ingesting API.
- [`@caravan-logger/transport-sqlite`](caravan/transport-sqlite): a
  transport that inserts log records as rows into a SQLite database.

## Usage

### Basic logging

Every logger needs an `id` and at least one transport to actually send records
somewhere. Log methods exist for each level (`trace`, `debug`, `info`, `warn`,
`error`, `fatal`) and accept a message, a context object or both.

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

### Logging to a file

`createStreamTransport` accepts any Node.js `Writable`. Each record is
written as its own line (`eol` controls the line ending and defaults to `"lf"`).

```ts
import { createWriteStream } from "node:fs";
import { createLogger } from "@caravan-logger/logger";
import { createStreamTransport } from "@caravan-logger/transport-stream";

const logger = createLogger("app", {
  transports: [createStreamTransport({ stream: createWriteStream("app.log", { flags: "a" }) })],
});

logger.info("server started", { port: 3000 });
await logger.flush();
```

### Context and child loggers

Context passed to `createLogger` is merged into every record the logger
writes. Child loggers created with `inherit` pick up the parent's level,
transports and context, and can extend the context further without mutating
the parent.

```ts
const requestLogger = createLogger("request", {
  inherit: { from: logger },
  context: { requestId: "abc-123" },
});

requestLogger.warn("slow response", { durationMs: 820 });

// per-call context is merged with the logger's own context
requestLogger.info("handled", { statusCode: 200 });
```

### Multiple and per-transport levels

A logger can fan a record out to several transports at once. Each transport
can define its own `level`, so it only receives records at or above that
level, regardless of the logger's own level.

```ts
import { createStreamTransport } from "@caravan-logger/transport-stream";

const logger = createLogger("app", {
  level: "TRACE",
  transports: [
    // everything goes to stdout
    createStreamTransport({ stream: process.stdout }),
    // only warnings and above go to the error stream
    createStreamTransport({ stream: process.stderr, level: "WARN" }),
  ],
});
```

### Custom formatting and transports

`createStreamTransport` writes to any Node.js or web `WritableStream` and
accepts a `format` function to control how records are serialized. You can
also build your own transport with `createTransport` for destinations other
than a stream (e.g. an HTTP endpoint or a database).

```ts
import { createTransport } from "@caravan-logger/logger";
import { createStreamTransport } from "@caravan-logger/transport-stream";

const prettyStream = createStreamTransport({
  stream: process.stdout,
  format: (record) => `[${record.level}] ${record.message} ${JSON.stringify(record.context)}`,
});

const remoteTransport = createTransport({
  write: async (record) => {
    await fetch("https://logs.example.com/ingest", {
      method: "POST",
      body: JSON.stringify(record),
    });
  },
});

const logger = createLogger("app", {
  transports: [prettyStream, remoteTransport],
});
```

### Middleware

Middleware runs on every record before it reaches transports, in the order
provided, and can transform or drop records (by returning `undefined`).
Child loggers inherit their parent's middleware. This is useful for
redacting sensitive fields, sampling, or enriching records.

```ts
const logger = createLogger("app", {
  transports: [createStreamTransport({ stream: process.stdout })],
  context: { password: "4f53a5c4-bfa5-4035-aba7-11e29a90c260" },
  middleware: [
    (record) => {
      if (!record.context?.["password"]) return record;
      return {
        ...record,
        context: { ...record.context, password: "*".repeat(5) },
      };
    },
  ],
});

logger.info("user authenticated");
```

### Flushing

Transports may buffer or perform async work (e.g. network writes). Call
`flush()` to wait for all pending writes on a logger's transports to settle
before your process exits.

```ts
await logger.flush();
```

## Development

This is a pnpm monorepo managed with Turbo.

```bash
pnpm install

# build
pnpm build:all           # everything
pnpm build:caravan       # only @caravan-logger/* packages
pnpm build:packages      # only @packages/* packages

# test, lint, format
pnpm test
pnpm lint
pnpm fmt
```
