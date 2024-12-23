import { LoggerError } from "@caravan-logger/logger";

type TDatadogErrorContext = {
  readonly internalError: any;
};

type TDatadogErrorConstructorParameters = {
  readonly message: string;
  readonly context?: TDatadogErrorContext;
};

abstract class DatadogError extends LoggerError<TDatadogErrorContext> {
  constructor({ message, context }: TDatadogErrorConstructorParameters) {
    super({ message, context });
  }
}

type TCouldNotWriteToDatadogErrorContext = {
  readonly internalError: any;
};

class CouldNotWriteToDatadogError extends DatadogError {
  constructor({ internalError }: TCouldNotWriteToDatadogErrorContext) {
    super({
      message: `Could not write to Datadog.`,
      context: { internalError },
    });
  }
}

export { DatadogError, CouldNotWriteToDatadogError };
