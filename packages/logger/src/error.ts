type TLoggerErrorParameters = {
  readonly message: string;
};

type TTimeoutErrorParameters = {
  operation: string;
};

abstract class LoggerError extends Error {
  constructor({ message }: TLoggerErrorParameters) {
    super(message);
  }
}

class NoTransportsError extends LoggerError {
  constructor() {
    super({
      message: `Could not find any Transports. Do you have any transports in your logger instance?`,
    });
  }
}

class TimeoutError extends LoggerError {
  constructor({ operation }: TTimeoutErrorParameters) {
    super({
      message: `Timeout reached while waiting for "${operation}" to complete.`,
    });
  }
}

export { LoggerError, NoTransportsError, TimeoutError };
