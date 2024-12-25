import { LoggerError } from "@caravan-logger/logger";

type TBetterStackErrorContext = {
  readonly statusCode: number;
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
  constructor({ statusCode }: TBetterStackErrorContext) {
    super({
      message: `Could not write to BetterStack.`,
      context: { statusCode },
    });
  }
}

export { BetterStackError, CouldNotWriteToBetterStackError };
