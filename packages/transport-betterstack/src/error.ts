import { LoggerError } from "@caravan-logger/logger";

type TBetterStackErrorContext = {
  readonly statusCode?: number;
  readonly error?: Error;
};

type TBetterStackErrorConstructorParameters = {
  readonly message: string;
  readonly context: TBetterStackErrorContext;
};

abstract class BetterStackError extends LoggerError<TBetterStackErrorContext> {
  constructor({ message, context }: TBetterStackErrorConstructorParameters) {
    super({ message, context });
  }
}

class CouldNotWriteToBetterStackError extends BetterStackError {
  constructor({
    statusCode,
  }: Required<Pick<TBetterStackErrorContext, "statusCode">>) {
    super({
      message: `Could not write to BetterStack.`,
      context: { statusCode },
    });
  }
}

class CouldNotFetchBetterStackError extends BetterStackError {
  constructor({ error }: Required<Pick<TBetterStackErrorContext, "error">>) {
    super({
      message: `${error.message}`,
      context: { error },
    });
  }
}

export {
  BetterStackError,
  CouldNotWriteToBetterStackError,
  CouldNotFetchBetterStackError,
};
