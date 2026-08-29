# @packages/benchmark

Internal, unpublished package that benchmarks `@caravan-logger/logger`
against [Pino](https://github.com/pinojs/pino) using
[tinybench](https://github.com/tinylibs/tinybench).

## Running

```bash
pnpm bench
```

## Methodology

Both loggers write to `/dev/null` so the numbers reflect logger overhead
rather than disk I/O. Pino is configured with `base: null` to drop its
default `pid`/`hostname` bindings, matching caravan's leaner record shape
(both still include a timestamp). Each measured sample performs 1,000 log
calls in a loop, batching to amortize per-call timer overhead.

Since caravan dispatches writes asynchronously, each caravan sample ends
with `await flush()` so it includes the cost of the writes actually
completing. Pino is measured in two modes for a like-for-like comparison:

- **pino (async)**: pino's default buffered `SonicBoom` destination
  (`sync: false`), flushed once per batch; this is the direct analogue to
  caravan's async, batch-flushed model.
- **pino (sync)**: `sync: true`, which writes on every call; this is a
  durable-write comparison where each record is fully written inline.

Three scenarios are covered, following the shape of
[Pino's own benchmark suite](https://github.com/pinojs/pino/blob/main/docs/benchmarks.md):

- **basic message**: a plain string message.
- **message with context**: a message plus a small object.
- **child logger**: a logger created with bound context (`inherit`/`child`).

## Results

Measured on Node v24.14.1 (Apple Silicon). Higher logs/sec is better; figures
are `avg ± relative margin of error` as reported by tinybench, scaled up by
the batch size to reflect actual log calls per second. Re-run `pnpm bench`
to get numbers for your own machine — these will drift with hardware, Node
version and library updates.

| Scenario             | caravan (logs/sec) | pino async (logs/sec) | pino sync (logs/sec) |
| -------------------- | ------------------ | --------------------- | -------------------- |
| basic message        | 1,057,079 ± 1.39%  | 523,372 ± 1.04%       | 771,828 ± 0.80%      |
| message with context | 929,044 ± 1.38%    | 461,143 ± 1.00%       | 645,613 ± 0.84%      |
| child logger         | 995,755 ± 1.35%    | 533,285 ± 1.10%       | 823,327 ± 0.53%      |

caravan comes out ahead in all three scenarios here, largely because its
core does less by default (no per-record time formatting beyond a numeric
epoch, no built-in serializers) and its stream transport is a thin
pass-through. Note that pino's records are not byte-identical to caravan's
(pino uses integer level codes and its own serializer), so this measures
overall throughput of each library's defaults rather than serialization of
an identical payload.
