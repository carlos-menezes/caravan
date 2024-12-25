# `@caravan-logger/transport-betterstack`

![NPM Last Update](https://img.shields.io/npm/v/@caravan-logger/transport-betterstack) ![NPM Last Update](https://img.shields.io/npm/last-update/@caravan-logger/transport-betterstack) ![NPM Last Update](https://img.shields.io/npm/l/@caravan-logger/transport-betterstack)

A transport for logging to BetterStack.

![BetterStack dashboard](https://i.imgur.com/WxibpAy.png)

## Installation

```bash
pnpm add @caravan-logger/transport-betterstack
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { BetterStackTransport } from "@caravan-logger/transport-betterstack";

const logger = new Logger({
  level: "INFO",
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
