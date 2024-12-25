# caravan 🚍

![NPM Last Update](https://img.shields.io/npm/v/@caravan-logger/logger) ![NPM Last Update](https://img.shields.io/npm/last-update/@caravan-logger/logger) ![NPM Last Update](https://img.shields.io/npm/l/@caravan-logger/logger)

A flexible, transport-based logging system for JavaScript/TypeScript applications.

## Features

- Multiple transport support (see [Transports](#transports));
- Log level filtering;
- Context binding through forked loggers;
- Data redaction capabilities;
- TypeScript-first!

## Installation

```sh
pnpm add @caravan-logger/logger

# Install one or more transports
pnpm add @caravan-logger/transport-console
pnpm add @caravan-logger/transport-file
pnpm add @caravan-logger/transport-datadog
pnpm add @caravan-logger/transport-betterstack
```

## Usage

```ts
import { Logger } from "@caravan-logger/logger";
import { ConsoleTransport } from "@caravan-logger/transport-console";

const logger = new Logger({
  level: "INFO",
  transports: [
    new ConsoleTransport({
      options: { pretty: true },
    }),
  ],
});

// Basic logging
logger.info("Hello, world!");

// Logging with metadata
logger.info("User logged in", { userId: "123", ip: "192.168.1.1" });
```

## Transports

- [ConsoleTransport](./packages/transport-console): a transport that logs to the console with optional pretty printing.
- [FileTransport](./packages/transport-file): a transport that logs to a file.
- [DatadogTransport](./packages/transport-datadog): a transport that logs to Datadog.
- [BetterStackTransport](./packages/transport-betterstack): a transport that logs to BetterStack.

## Features

#### Log Levels

- `TRACE`: extremely detailed diagnostic information showing every step of execution.
- `DEBUG`: detailed information useful for development and troubleshooting.
- `INFO`: general operational messages about program state and execution flow.
- `WARN`: potentially harmful situations that don't prevent normal operation.
- `ERROR`: issues preventing specific functionality from working properly.
- `FATAL`: critical failures that stop core business functions from operating.

Each transport can have its own minimum log level, and the logger itself can have a global minimum level.

#### Context Binding

You can create a forked logger with a specific context:

```ts
const userLogger = logger.fork({
  context: { userId: "7b2f1c51-511a-4188-a9e1-942a9aab555c" },
});
userLogger.info("Profile updated"); // Will include `userId` in all logs
```

#### Data Redaction

You can configure sensitive data redaction:

```ts
const logger = new Logger({
  level: "INFO",
  transports: [new ConsoleTransport({ options: { pretty: true } })],
  redact: {
    paths: ["password", "creditCard.number"],
    censor: "[REDACTED]",
  },
});
```
