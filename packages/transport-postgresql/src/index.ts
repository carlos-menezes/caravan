import {
  type TLogEntry,
  Transport,
  type TTransportBaseConstructorOptions,
} from "@caravan-logger/logger";
import { Pool, QueryConfig } from "pg";
import format from "pg-format";
import {
  CouldNotCreateTableError,
  CouldNotInsertIntoTableError,
  FailedToClosePoolError,
} from "./error";
import {
  CREATE_TABLE,
  DEFAULT_TABLE,
  INSERT_INTO,
  TABLE_EXISTS,
} from "./table";

type TTableTransportOptions = {
  pool: Pool;
  table?: string | undefined;
};

class PostgreSQLTransport extends Transport<TTableTransportOptions> {
  private readonly pool: Pool;
  private readonly table: string;

  constructor(
    options: TTransportBaseConstructorOptions<TTableTransportOptions>,
  ) {
    super(options);

    this.pool = options.options.pool;
    this.table = options.options.table || DEFAULT_TABLE;
  }

  /**
   * Check if requested table exists. If table is missing, create it.
   */
  async init(): Promise<void> {
    try {
      const data = await this.pool.query<{ exists: boolean }>(
        format(TABLE_EXISTS, this.table),
      );
      const tableExists = data.rows[0]?.exists ?? false;
      if (!tableExists) {
        await this.pool.query(format(CREATE_TABLE, this.table));
      }
    } catch (error) {
      throw new CouldNotCreateTableError({
        table: this.pool.options.database,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async handle({
    level,
    message,
    hostname,
    processId,
    time,
    data,
  }: TLogEntry): Promise<void> {
    try {
      const query = {
        text: format(INSERT_INTO, this.table),
        values: [
          level,
          message,
          hostname,
          processId,
          time instanceof Date ? time : new Date(time),
          JSON.stringify(data),
        ],
      } satisfies QueryConfig;
      await this.pool.query(query);
    } catch (error) {
      throw new CouldNotInsertIntoTableError({
        table: this.table,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Close current pool connection.
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
    } catch (error) {
      throw new FailedToClosePoolError({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export { PostgreSQLTransport };
