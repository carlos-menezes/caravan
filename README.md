> [!NOTE]  
> There is no release available in the npm registry yet.

# caravan 🚍

A logger built for anything.

## Installation

```sh
pnpm add @caravan-logger/logger

# you must also install a transport
# see the Transports section for more information
pnpm add @caravan-logger/transport-console
```

## Usage

```ts
import { Logger } from "caravan-logger";
import { ConsoleTransport } from "@caravan-logger/transport-console";
import { FileTransport } from "@caravan-logger/transport-file";

const logger = new Logger({
  level: "info",
  transports: [
    new ConsoleTransport({ options: { pretty: true } }),
    new FileTransport({ options: { path: "app.log" } }),
  ],
});

logger.info("Hello, world!");
logger.info("Hello", { who: "world" });

const acmeLogger = logger.fork({ context: { company: "Acme" } });
acmeLogger.info("Service is running", { service: "acme-service" });
```

Will output the following to `stdout`:

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

And will output to the file `app.log`:

```log
2024-12-23T00:24:45.163Z INFO Carloss-MacBook-Pro-3.local:62812 Hello, world!
2024-12-23T00:24:45.163Z INFO Carloss-MacBook-Pro-3.local:62812 Hello {"who":"world"}
2024-12-23T00:24:45.163Z INFO Carloss-MacBook-Pro-3.local:62812 Service is running {"company":"Acme","service":"acme-service"}
```

## Transports

- [ConsoleTransport](./packages/transport-console): a transport that logs to the console with optional pretty printing.
- [FileTransport](./packages/transport-file): a transport that logs to a file.
