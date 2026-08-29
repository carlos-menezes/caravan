import {
  createBatcher,
  createTransport,
  type TBatchableConfiguration,
  type TCreateTransportBaseConfiguration,
  type TLogRecord,
} from "@caravan-logger/logger";
import Database from "better-sqlite3";

export type TCreateSqliteTransportConfiguration = TCreateTransportBaseConfiguration &
  TBatchableConfiguration & {
    /** An already-constructed better-sqlite3 database. The transport doesn't manage its lifecycle. */
    db: Database.Database;
    /** Table log records are inserted into. Must be a valid SQL identifier. Defaults to "logs". */
    table?: string;
    /**
     * Serializes a record's context to the stored "context" column. Defaults to JSON.stringify, or
     * null when absent.
     */
    serializeContext?: (context: object | undefined) => string | null;
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

  const batcher = createBatcher<TLogRecord>({
    size: configuration.batchConfiguration?.size ?? configuration.batchSize,
    flushInterval: configuration.batchConfiguration?.flushInterval ?? configuration.flushInterval,
    sendBatch: insertMany,
  });

  return createTransport<TCreateSqliteTransportConfiguration>(
    {
      write: (record) => batcher.push(record),
      flush: () => batcher.flush(),
    },
    configuration,
  );
};
