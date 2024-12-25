# `@caravan-logger/transport-console`

![NPM Last Update](https://img.shields.io/npm/v/@caravan-logger/transport-console) ![NPM Last Update](https://img.shields.io/npm/last-update/@caravan-logger/transport-console) ![NPM Last Update](https://img.shields.io/npm/l/@caravan-logger/transport-console)

A transport for logging to the console.

```sh
2024-12-24T20:55:49.846Z DEBUG Carloss-MacBook-Pro-3.local:21459 Hello, debug level!
{
  "tech": "caravan"
}
2024-12-24T20:55:49.850Z INFO  Carloss-MacBook-Pro-3.local:21459 Hello, info level!
{
  "tech": "caravan"
}
2024-12-24T20:55:49.850Z WARN  Carloss-MacBook-Pro-3.local:21459 Hello, warn level!
{
  "tech": "caravan"
}
2024-12-24T20:55:49.850Z ERROR Carloss-MacBook-Pro-3.local:21459 Hello, error level!
{
  "tech": "caravan"
}
2024-12-24T20:55:49.850Z FATAL Carloss-MacBook-Pro-3.local:21459 Hello, fatal level!
{
  "tech": "caravan"
}
```

## Installation

```bash
pnpm add @caravan-logger/transport-console
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { ConsoleTransport } from "@caravan-logger/transport-console";

const logger = new Logger({
  level: "INFO",
  transports: [
    new ConsoleTransport({
      options: {
        pretty: true,
      },
    }),
  ],
});
```
