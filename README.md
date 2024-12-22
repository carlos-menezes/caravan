> [!NOTE]  
> There is no release available in the npm registry yet.

# caravan 🚍

A logger built for anything.

## Installation

```sh
pnpm add @caravan-logger/logger
# you must also install a transport
pnpm add @caravan-logger/transport-console
```

## Usage

```ts
import { Logger } from "caravan-logger";
import { ConsoleTransport } from "@caravan-logger/transport-console";

const logger = new Logger({
  level: "info",
  transports: [new ConsoleTransport({ options: { pretty: true } })],
});

logger.info("Hello, world!");
logger.info("Hello", { who: "world" });

const acmeLogger = logger.fork({ context: { company: "Acme" } });
acmeLogger.info("Service is running", { service: "acme-service" });
```

Will output:

```sh
2024-12-22T20:30:08.803Z info  Carloss-MacBook-Pro-3.local:43123 - Hello, world!
2024-12-22T20:30:08.804Z info  Carloss-MacBook-Pro-3.local:43123 - Hello
{
  "who": "world"
}
2024-12-22T20:30:08.804Z info  Carloss-MacBook-Pro-3.local:43123 - Service is running
{
  "company": "Acme",
  "service": "acme-service"
}
```

## Transports

- [ConsoleTransport](./packages/transport-console)
