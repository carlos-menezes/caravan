import { LoggerError } from "@caravan-logger/logger";

type TCouldNotCreateTableErrorContext = {
  readonly table: string | undefined;
  readonly error?: string;
};

class CouldNotCreateTableError
  extends LoggerError<TCouldNotCreateTableErrorContext> {
  constructor({ table, error }: TCouldNotCreateTableErrorContext) {
    super({
      message: `Could not create table.`,
      context: { table, error },
    });
  }
}

type TCouldNotInsertIntoTableErrorContext = {
  readonly table: string | undefined;
  readonly error?: string;
};

class CouldNotInsertIntoTableError
  extends LoggerError<TCouldNotInsertIntoTableErrorContext> {
  constructor({ table, error }: TCouldNotInsertIntoTableErrorContext) {
    super({
      message: `Could not insert into table.`,
      context: { table, error },
    });
  }
}

type TFailedToClosePoolErrorContext = {
  readonly error?: string;
};

class FailedToClosePoolError
  extends LoggerError<TFailedToClosePoolErrorContext> {
  constructor({ error }: TFailedToClosePoolErrorContext) {
    super({
      message: `Failed to close pool.`,
      context: { error },
    });
  }
}

export {
  CouldNotCreateTableError,
  CouldNotInsertIntoTableError,
  FailedToClosePoolError,
};
