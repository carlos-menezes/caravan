# @caravan-logger/transport-stream

A [Caravan](../../README.md) transport that writes log records to a Node.js
or web `WritableStream`.

## Install

```sh
pnpm add @caravan-logger/transport-stream
```

## Usage

```ts
import { createLogger } from "@caravan-logger/logger";
import { createStreamTransport } from "@caravan-logger/transport-stream";

const logger = createLogger("app", {
  transports: [createStreamTransport({ stream: process.stdout })],
});

logger.info("server started", { port: 3000 });
await logger.flush();
```

## Options

| Option   | Type                                        | Default                     | Description                                            |
| -------- | ------------------------------------------- | --------------------------- | ------------------------------------------------------ |
| `stream` | `Stream.Writable \| WritableStream<string>` | —                           | Writable stream log records are written to (required). |
| `format` | `(record: TLogRecord) => string`            | `JSON.stringify`            | Formats a record before it's written to the stream.    |
| `eol`    | `"lf" \| "crlf"`                            | `"lf"`                      | Line ending appended after each record.                |
| `level`  | `TDefaultLevels`                            | inherits the logger's level | Drops records below this level before `write()` runs.  |
