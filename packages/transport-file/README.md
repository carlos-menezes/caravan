# `@caravan-logger/transport-file`

A transport for logging to a file.

## Installation

```bash
pnpm add @caravan-logger/transport-file
```

## Usage

```typescript
import { Logger } from "caravan-logger";
import { FileTransport } from "@caravan-logger/transport-file";

const logger = new Logger({
  level: "info",
  transports: [
    new FileTransport({
      options: {
        path: "app.log",
      },
    }),
  ],
});
```
