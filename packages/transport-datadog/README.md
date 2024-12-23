# `@caravan-logger/transport-datadog`

A transport for logging to Datadog.

## Installation

```bash
pnpm add @caravan-logger/transport-datadog
```

## Usage

```typescript
import { Logger } from "caravan-logger";
import { DatadogTransport } from "@caravan-logger/transport-datadog";

const logger = new Logger({
  level: "info",
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
