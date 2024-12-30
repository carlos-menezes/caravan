# `@caravan-logger/transport-opentelemetry`

![NPM Last Update](https://img.shields.io/npm/v/@caravan-logger/transport-opentelemetry) ![NPM Last Update](https://img.shields.io/npm/last-update/@caravan-logger/transport-opentelemetry) ![NPM Last Update](https://img.shields.io/npm/l/@caravan-logger/transport-opentelemetry)

## Installation

```bash
pnpm add @caravan-logger/transport-opentelemetry
```

## Usage

```typescript
import { Logger } from "@caravan-logger/logger";
import { OpenTelemetryTransport } from "@caravan-logger/transport-opentelemetry";

const logger = new Logger({
  level: "INFO",
  transports: [
    new OpenTelemetryTransport({
      options: {
        logRecordProcessorOptions: [
          {
            recordProcessorType: "simple",
            exporterOptions: { protocol: "http" },
          },
        ],
        serviceVersion: "1.0.0",
        loggerName: "caravan-logger",
      },
    }),
  ],
});
```
