import { LoggerError } from "@caravan-logger/logger";

type TDiscordErrorContext = {
  readonly statusCode?: number;
  readonly error?: Error;
};

type TDiscordErrorConstructorParameters = {
  readonly message: string;
  readonly context: TDiscordErrorContext;
};

abstract class DiscordError extends LoggerError<TDiscordErrorContext> {
  constructor({ message, context }: TDiscordErrorConstructorParameters) {
    super({ message, context });
  }
}

class CouldNotWriteToDiscordError extends DiscordError {
  constructor({
    statusCode,
  }: Required<Pick<TDiscordErrorContext, "statusCode">>) {
    super({
      message: `Could not write to Discord.`,
      context: { statusCode },
    });
  }
}

class CouldNotFetchDiscordError extends DiscordError {
  constructor({ error }: Required<Pick<TDiscordErrorContext, "error">>) {
    super({
      message: `${error.message}`,
      context: { error },
    });
  }
}

export { DiscordError, CouldNotWriteToDiscordError, CouldNotFetchDiscordError };
