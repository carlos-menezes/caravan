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
calls in a loop, batching to amortize per-call timer overhead; for caravan
this is followed by `await flush()` so the sample includes the cost of the
write actually completing, since caravan dispatches writes asynchronously.

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

| Scenario             | caravan (logs/sec) | pino (logs/sec) |
| -------------------- | ------------------ | --------------- |
| basic message        | 1,085,874 ± 1.22%  | 806,705 ± 0.38% |
| message with context | 964,148 ± 1.18%    | 673,036 ± 0.38% |
| child logger         | 1,073,625 ± 1.02%  | 842,093 ± 0.27% |

caravan comes out ahead in all three scenarios here, largely because its
core does less by default (no per-record time formatting beyond a numeric
epoch, no built-in serializers) and its stream transport is a thin
pass-through.
