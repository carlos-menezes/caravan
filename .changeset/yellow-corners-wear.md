---
"@caravan-logger/logger": minor
---

feat(core): make `id` optional in `createLogger` when inheriting

Adds an overload to createLogger so `id` can be omitted when
`options.inherit.from` is provided, defaulting to the parent
logger's id. Passing an explicit id still works and overrides
the parent's id.
