type TLoggerErrorConstructorParameters<
  TContext extends Record<string | number | symbol, unknown> = {},
> = {
  readonly message: string;
  readonly context?: TContext;
};

abstract class LoggerError<
  TContext extends Record<string | number | symbol, unknown> = {},
> extends Error {
  private readonly _context?: TContext;

  constructor({
    message,
    context,
  }: TLoggerErrorConstructorParameters<TContext>) {
    super(message);
    this._context = context;
  }

  get context(): TContext | undefined {
    return this._context;
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
