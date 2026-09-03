---
"@caravan-logger/logger": minor
"@caravan-logger/transport-sqlite": minor
"@caravan-logger/transport-datadog": minor
"@caravan-logger/transport-better-stack": minor
---

feat: express transport batching through a shared `batch` type

Adds `TBatchableConfiguration` (`{ batch: true; batchConfiguration?: { size?, flushInterval? } }`)
to the core, and routes the SQLite, Datadog and Better Stack transports through the shared
`createBatcher`. Configure batching per transport via:

```ts
createSqliteTransport({ db, batch: true, batchConfiguration: { size: 100, flushInterval: 1000 } });
```

The per-transport `batchSize` and `flushInterval` options are deprecated.
