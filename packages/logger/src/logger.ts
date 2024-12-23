import { NoTransportsError } from "./error";
import { LogLevelMap, TLogLevel } from "./level";
import { Transport } from "./transport";
import { hostname } from "os";

type TLoggerOptions = {
  readonly level: TLogLevel;
  readonly transports: Array<Transport>;
};

type TExtendedRecord = Record<string | number | symbol, unknown>;

type TLogEntry<TObject extends TExtendedRecord = {}> = {
  readonly level: TLogLevel;
  readonly date: Date;
  readonly message: string;
  readonly hostname: string;
  readonly processId: number;
  readonly context?: TExtendedRecord;
  readonly object?: TObject;
};

type TLogParameters<
  TObject extends Record<string | number | symbol, unknown> = {},
> = Pick<TLogEntry<TObject>, "level" | "message"> & {
  readonly object?: TObject;
};

type TForkParameters = {
  readonly context?: TExtendedRecord;
};

/**
 * Logger class for handling application logging with multiple transports
 */
class Logger {
  private readonly _options: TLoggerOptions;
  private readonly _context?: TExtendedRecord;

  /**
   * Creates a new Logger instance
   * @param options - Configuration options for the logger
   */
  constructor(options: TLoggerOptions, context?: TExtendedRecord) {
    if (options.transports.length === 0) {
      throw new NoTransportsError();
    }

    this._options = options;
    this._context = context;
  }

  private _log<TObject extends Record<string | number | symbol, unknown>>({
    level,
    message,
    object,
  }: TLogParameters<TObject>) {
    for (const transport of this._options.transports) {
      // Check if the current log level is greater than or equal to the logger's level
      const isGlobalLoggable =
        LogLevelMap[level] >= LogLevelMap[this._options.level];

      // Check if the current log level is greater than or equal to the transport's level.
      const isTransportLoggable =
        LogLevelMap[level] >= LogLevelMap[transport.level];

      // If the log level is not greater than or equal to the logger's level or the transport's level, skip logging.
      if (!isGlobalLoggable || !isTransportLoggable) continue;

      transport.handle({
        message,
        level,
        date: new Date(),
        hostname: hostname(),
        processId: process.pid,
        context: this._context,
        object,
      });
    }
  }

  /**
   * Logs a debug level message
   * @param message - The message to log
   */
  debug<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "debug", object });
  }

  //#region Shorthand methods for log levels.
  info<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "info", object });
  }

  warn<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "warn", object });
  }

  error<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "error", object });
  }
  //#endregion

  /**
   * Creates a new Logger instance with the same options and additional bindings
   * @param parameters - Fork parameters including optional bindings
   * @returns A new Logger instance
   */
  fork({ context }: TForkParameters): Logger {
    const forkedLogger = new Logger(this._options, context);
    return forkedLogger;
  }
}

export { Logger };
export type { TLogEntry };
