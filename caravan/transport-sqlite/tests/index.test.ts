import Database from "better-sqlite3";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSqliteTransport } from "../src/index";

type TRow = {
  id: string;
  level: string;
  time: number;
  message: string;
  context: string | null;
};

const selectAll = (db: Database.Database, table = "logs"): TRow[] =>
  db.prepare(`SELECT * FROM "${table}"`).all() as TRow[];

describe("createSqliteTransport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("creates the default table and inserts a record immediately", async () => {
    const db = new Database(":memory:");
    const transport = createSqliteTransport({ db });

    transport.send({
      id: "test-logger",
      level: "INFO",
      time: 1,
      context: { foo: "bar" },
      message: "hello",
    });
    await transport.flush();

    const rows = selectAll(db);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "test-logger",
      level: "INFO",
      time: 1,
      message: "hello",
      context: JSON.stringify({ foo: "bar" }),
    });
  });

  it("stores null context when no context is provided", async () => {
    const db = new Database(":memory:");
    const transport = createSqliteTransport({ db });

    transport.send({ id: "test-logger", level: "INFO", time: 1, message: "hello" });
    await transport.flush();

    expect(selectAll(db)[0]?.context).toBeNull();
  });

  it("buffers records until batch size is reached", async () => {
    const db = new Database(":memory:");
    const transport = createSqliteTransport({ db, batch: true, batchConfiguration: { size: 2 } });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "one" });
    expect(selectAll(db)).toHaveLength(0);

    transport.send({ id: "test-logger", level: "INFO", time: 2, context: {}, message: "two" });
    await transport.flush();

    expect(selectAll(db)).toHaveLength(2);
  });

  it("supports the deprecated batchSize option", async () => {
    const db = new Database(":memory:");
    const transport = createSqliteTransport({ db, batchSize: 2 });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "one" });
    expect(selectAll(db)).toHaveLength(0);

    transport.send({ id: "test-logger", level: "INFO", time: 2, context: {}, message: "two" });
    await transport.flush();

    expect(selectAll(db)).toHaveLength(2);
  });

  it("flush inserts any remaining buffered records", async () => {
    const db = new Database(":memory:");
    const transport = createSqliteTransport({ db, batch: true, batchConfiguration: { size: 10 } });

    transport.send({ id: "test-logger", level: "WARN", time: 1, context: {}, message: "hello" });
    await transport.flush();

    expect(selectAll(db)).toHaveLength(1);
  });

  it("does not write records below the configured level", async () => {
    const db = new Database(":memory:");
    const transport = createSqliteTransport({ db, level: "WARN" });

    transport.send({
      id: "test-logger",
      level: "INFO",
      time: 1,
      context: {},
      message: "should be dropped",
    });
    await transport.flush();

    expect(selectAll(db)).toHaveLength(0);
  });

  it("inserts into a custom table name", async () => {
    const db = new Database(":memory:");
    const transport = createSqliteTransport({ db, table: "app_logs" });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });
    await transport.flush();

    expect(selectAll(db, "app_logs")).toHaveLength(1);
  });

  it("throws on an invalid table name", () => {
    const db = new Database(":memory:");

    expect(() => createSqliteTransport({ db, table: "logs; DROP TABLE logs" })).toThrow(
      /Invalid SQLite transport table name/,
    );
  });

  it("uses a custom serializeContext function", async () => {
    const db = new Database(":memory:");
    const transport = createSqliteTransport({
      db,
      serializeContext: (context) => (context ? `custom:${JSON.stringify(context)}` : null),
    });

    transport.send({
      id: "test-logger",
      level: "INFO",
      time: 1,
      context: { foo: "bar" },
      message: "hello",
    });
    await transport.flush();

    expect(selectAll(db)[0]?.context).toBe('custom:{"foo":"bar"}');
  });

  it("flushes buffered records on the configured interval", async () => {
    vi.useFakeTimers();
    const db = new Database(":memory:");
    const transport = createSqliteTransport({
      db,
      batch: true,
      batchConfiguration: { size: 10, flushInterval: 1000 },
    });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });
    await vi.advanceTimersByTimeAsync(0);
    expect(selectAll(db)).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(1000);

    expect(selectAll(db)).toHaveLength(1);
    await transport.flush();
  });
});
