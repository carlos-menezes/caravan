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
const pinoLogger = pino({ base: null }, pino.destination({ dest: "/dev/null", sync: true }));
const pinoChild = pinoLogger.child({ module: "bench" });

const bench = new Bench({ time: 500 });

bench
  .add("caravan - basic message", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      caravanLogger.info("hello world");
    }
    await caravanLogger.flush();
  })
  .add("pino - basic message", () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoLogger.info("hello world");
    }
  })
  .add("caravan - message with context", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      caravanLogger.info("hello world", context);
    }
    await caravanLogger.flush();
  })
  .add("pino - message with context", () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoLogger.info(context, "hello world");
    }
  })
  .add("caravan - child logger", async () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      caravanChild.info("hello world");
    }
    await caravanChild.flush();
  })
  .add("pino - child logger", () => {
    for (let i = 0; i < BATCH_SIZE; i++) {
      pinoChild.info("hello world");
    }
  });

await bench.run();

// tinybench reports batch throughput, not individual log calls; scale it up and drop the
// noisy/wide default columns so the table fits the terminal and reads in real log calls/sec.
const toRow: ConsoleTableConverter = (task) => {
  const result = task.result;
  if (!result || result.state !== "completed") {
    return { Task: task.name, "Logs/sec": "N/A" };
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
