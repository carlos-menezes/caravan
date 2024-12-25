# `@caravan-logger/transport-datadog`

![NPM Last Update](https://img.shields.io/npm/v/@caravan-logger/transport-datadog) ![NPM Last Update](https://img.shields.io/npm/last-update/@caravan-logger/transport-datadog) ![NPM Last Update](https://img.shields.io/npm/l/@caravan-logger/transport-datadog)

A transport for logging to DataDog.

![Datadog dashboard](https://i.imgur.com/2U1Or2f.png)

## Installation

```bash
pnpm add @caravan-logger/transport-datadog
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { DatadogTransport } from "@caravan-logger/transport-datadog";

const logger = new Logger({
  level: "INFO",
  transports: [
    new DatadogTransport({
      options: {
        apiKey: "<API_KEY>",
        ddsite: "datadoghq.eu",
        ddsource: "<INTEGRATION_NAME>",
        ddtags: ["environment:develop"],
        hostname: "carlos-menezes:workstation",
        service: "my-service",
      },
    }),
  ],
});
```
