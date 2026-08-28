---
"@caravan-logger/transport-stream": patch
"@caravan-logger/transport-datadog": patch
"@caravan-logger/transport-sqlite": patch
"@caravan-logger/transport-better-stack": patch
---

Move `@caravan-logger/logger` from `devDependencies` to `dependencies`. Each transport package imports and calls `createTransport` from it at runtime, so it must be installed for consumers, not just during development. Under isolated `node_modules` installs (pnpm strict mode), the missing dependency prevented the package's own type declarations from resolving, causing every exported type to silently degrade to `any`.
