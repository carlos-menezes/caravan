import {
  createTransport,
  type TCreateTransportBaseConfiguration,
  type TLogRecord,
} from "@caravan-logger/logger";
import Database from "better-sqlite3";

export type TCreateSqliteTransportConfiguration = TCreateTransportBaseConfiguration & {
  /** An already-constructed better-sqlite3 database. The transport doesn't manage its lifecycle. */
  db: Database.Database;
  /** Table log records are inserted into. Must be a valid SQL identifier. Defaults to "logs". */
  table?: string;
  /**
   * Serializes a record's context to the stored "context" column. Defaults to JSON.stringify, or
   * null when absent.
   */
  serializeContext?: (context: object | undefined) => string | null;
  /** Number of records buffered before a batch insert runs. Defaults to 1 (insert immediately). */
  batchSize?: number;
  /** Interval, in milliseconds, at which buffered records are inserted regardless of `batchSize`. */
  flushInterval?: number;
};

const TABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const defaultSerializeContext = (context: object | undefined): string | null =>
  context === undefined ? null : JSON.stringify(context);

/**
 * Creates a transport that inserts log records as rows into a SQLite database via `better-sqlite3`.
 *
 * @param configuration - The configuration for the SQLite transport.
 * @returns A transport that writes log records to the configured database.
 */
export const createSqliteTransport = (configuration: TCreateSqliteTransportConfiguration) => {
  const table = configuration.table ?? "logs";
  if (!TABLE_NAME_PATTERN.test(table)) {
    throw new Error(`Invalid SQLite transport table name: "${table}"`);
  }

  const { db } = configuration;
  const serializeContext = configuration.serializeContext ?? defaultSerializeContext;
  const batchSize = configuration.batchSize ?? 1;

  db.exec(
    `CREATE TABLE IF NOT EXISTS "${table}" (id TEXT NOT NULL, level TEXT NOT NULL, time INTEGER NOT NULL, message TEXT NOT NULL, context TEXT)`,
  );

  const insert = db.prepare(
    `INSERT INTO "${table}" (id, level, time, message, context) VALUES (?, ?, ?, ?, ?)`,
  );

  const insertMany = db.transaction((records: TLogRecord[]) => {
    for (const record of records) {
      insert.run(
        record.id,
        record.level,
        record.time,
        record.message,
        serializeContext(record.context),
      );
    }
  });

  let buffer: TLogRecord[] = [];

  const flushBuffer = (): void => {
    if (buffer.length === 0) {
      return;
    }

    const batch = buffer;
    buffer = [];
    insertMany(batch);
  };

  const timer = configuration.flushInterval
    ? setInterval(flushBuffer, configuration.flushInterval)
    : undefined;
  timer?.unref?.();

  return createTransport<TCreateSqliteTransportConfiguration>(
    {
      write: (record) => {
        buffer.push(record);

        if (buffer.length >= batchSize) {
          flushBuffer();
        }
      },
      flush: () => {
        flushBuffer();
      },
    },
    configuration,
  );
};
