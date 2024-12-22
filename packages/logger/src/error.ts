type TLoggerErrorParameters = {
  readonly message: string;
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

export { LoggerError, NoTransportsError };
