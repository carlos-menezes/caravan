# `@caravan-logger/transport-console`

A transport for logging to the console.

## Installation

```bash
pnpm add @caravan-logger/transport-console
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { ConsoleTransport } from "@caravan-logger/transport-console";

const logger = new Logger({
  level: "info",
  transports: [
    new ConsoleTransport({
      options: {
        pretty: true,
      },
    }),
  ],
});
```
