# `@caravan-logger/transport-datadog`

A transport for logging to Datadog.

## Installation

```bash
pnpm add @caravan-logger/transport-betterstack
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { BetterStackTransport } from "@caravan-logger/transport-betterstack";

const logger = new Logger({
  level: "info",
  transports: [
    new BetterStackTransport({
      options: {
        sourceToken: "<SOURCE_TOKEN>",
        hooks: {
          onError: async ({ error, log }) => {
            console.error(error);
          },
        },
      },
    }),
  ],
});
```
