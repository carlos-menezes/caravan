# `@caravan-logger/transport-discord`

![NPM Last Update](https://img.shields.io/npm/v/@caravan-logger/transport-discord) ![NPM Last Update](https://img.shields.io/npm/last-update/@caravan-logger/transport-discord) ![NPM Last Update](https://img.shields.io/npm/l/@caravan-logger/transport-discord)

![Discord](https://i.imgur.com/ONFO2wV.png)

## Installation

```bash
pnpm add @caravan-logger/transport-discord
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { OpenTelemetryTransport } from "@caravan-logger/transport-discord";

const logger = new Logger({
  level: "INFO",
  transports: [
    new DiscordTransport({
      options: {
        webhook: {
          id: "<REDACTED>",
          token: "<REDACTED>",
        },
        overrides: {
          title: "My Service Logger",
          username: "acme-logger",
          avatarUrl: "https://placecats.com/300/200",
          // Partially override the color map
          colors: {
            INFO: 0x00ff01,
          },
        },
      },
    }),
  ],
});
```
