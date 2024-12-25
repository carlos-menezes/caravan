import { LoggerError } from "@caravan-logger/logger";

type TDatadogErrorContext = {
  readonly statusCode: number;
};

type TDatadogErrorConstructorParameters = {
  readonly message: string;
  readonly context: TDatadogErrorContext;
};

abstract class DatadogError extends LoggerError<TDatadogErrorContext> {
  constructor({ message, context }: TDatadogErrorConstructorParameters) {
    super({ message, context });
  }
}

class CouldNotWriteToDatadogError extends DatadogError {
  constructor({ statusCode }: TDatadogErrorContext) {
    super({
      message: `Could not write to Datadog.`,
      context: { statusCode },
    });
  }
}

export { DatadogError, CouldNotWriteToDatadogError };
