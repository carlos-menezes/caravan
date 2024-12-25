# `@caravan-logger/transport-file`

![NPM Last Update](https://img.shields.io/npm/v/@caravan-logger/transport-file) ![NPM Last Update](https://img.shields.io/npm/last-update/@caravan-logger/transport-file) ![NPM Last Update](https://img.shields.io/npm/l/@caravan-logger/transport-file)

A transport for logging to a file.

```txt
2024-12-24T20:55:49.850Z DEBUG Carloss-MacBook-Pro-3.local:21459 Hello, debug level! {"tech":"caravan"}
2024-12-24T20:55:49.850Z INFO Carloss-MacBook-Pro-3.local:21459 Hello, info level! {"tech":"caravan"}
2024-12-24T20:55:49.850Z WARN Carloss-MacBook-Pro-3.local:21459 Hello, warn level! {"tech":"caravan"}
2024-12-24T20:55:49.850Z ERROR Carloss-MacBook-Pro-3.local:21459 Hello, error level! {"tech":"caravan"}
2024-12-24T20:55:49.850Z FATAL Carloss-MacBook-Pro-3.local:21459 Hello, fatal level! {"tech":"caravan"}
```

## Installation

```bash
pnpm add @caravan-logger/transport-file
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { FileTransport } from "@caravan-logger/transport-file";

const logger = new Logger({
  level: "INFO",
  transports: [
    new FileTransport({
      options: {
        path: "app.log",
      },
    }),
  ],
});
```
