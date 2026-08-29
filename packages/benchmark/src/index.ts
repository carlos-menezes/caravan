import fs from "node:fs";

import { createLogger } from "@caravan-logger/logger";
import { createStreamTransport } from "@caravan-logger/transport-stream";
import pino from "pino";
import { Bench, type ConsoleTableConverter } from "tinybench";

// Number of log calls made per measured iteration, to amortize per-call timer overhead.
const BATCH_SIZE = 1_000;

const context = { a: 1, b: "two", c: true };

const caravanLogger = createLogger("bench", {
  level: "INFO",
  transports: [createStreamTransport({ stream: fs.createWriteStream("/dev/null") })],
});
const caravanChild = createLogger({
  inherit: { from: caravanLogger },
  context: { module: "bench" },
});

// base: null drops pino's default pid/hostname bindings, matching caravan's leaner record shape.
// sync: writes on every call, matching a durable-write comparison.
const pinoSync = pino({ base: null }, pino.destination({ dest: "/dev/null", sync: true }));
const pinoSyncChild = pinoSync.child({ module: "bench" });
// async: pino's default SonicBoom buffering, flushed once per batch to match caravan's async model.
const pinoAsync = pino({ base: null }, pino.destination({ dest: "/dev/null", sync: false }));
const pinoAsyncChild = pinoAsync.child({ module: "bench" });

const flushPino = (logger: pino.Logger): Promise<void> =>
  new Promise((resolve, reject) => {
    logger.flush((error) => (error ? reject(error) : resolve()));
  });

const bench = new Bench({ time: 500 });

bench
  .add("caravan - basic message", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      caravanLogger.info("hello world");
    }
    await caravanLogger.flush();
  })
  .add("pino (async) - basic message", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoAsync.info("hello world");
    }
    await flushPino(pinoAsync);
  })
  .add("pino (sync) - basic message", () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoSync.info("hello world");
    }
  })
  .add("caravan - message with context", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      caravanLogger.info("hello world", context);
    }
    await caravanLogger.flush();
  })
  .add("pino (async) - message with context", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoAsync.info(context, "hello world");
    }
    await flushPino(pinoAsync);
  })
  .add("pino (sync) - message with context", () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoSync.info(context, "hello world");
    }
  })
  .add("caravan - child logger", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      caravanChild.info("hello world");
    }
    await caravanChild.flush();
  })
  .add("pino (async) - child logger", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoAsyncChild.info("hello world");
    }
    await flushPino(pinoAsyncChild);
  })
  .add("pino (sync) - child logger", () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoSyncChild.info("hello world");
    }
  });

await bench.run();

const toRow: ConsoleTableConverter = (task) => {
  const result = task.result;
  if (!result || result.state !== "completed") {
    return { Task: task.name, "Logs/sec": "N/A", "Avg batch latency (ms)": "N/A", Samples: "N/A" };
  }

  return {
    Task: task.name,
    "Logs/sec": `${Math.round(result.throughput.mean * BATCH_SIZE).toLocaleString()} ± ${result.throughput.rme.toFixed(2)}%`,
    "Avg batch latency (ms)": result.latency.mean.toFixed(3),
    Samples: result.latency.samplesCount,
  };
};

console.log(`Each sample performs ${BATCH_SIZE} log calls.\n`);
console.table(bench.table(toRow));
