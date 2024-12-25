import { NoTransportsError } from "./error";
import { LogLevelMap, TLogLevel } from "./level";
import { Transport } from "./transport";
import { hostname } from "os";
import fastRedact, { RedactOptions } from "fast-redact";

type TLoggerOptions = {
  readonly level: TLogLevel;
  readonly transports: Array<Transport>;
  readonly redact?: RedactOptions;
};

type TExtendedRecord = Record<string | number | symbol, unknown>;

type TLogEntry<TObject extends TExtendedRecord = TExtendedRecord> = {
  readonly level: TLogLevel;
  readonly time: Date;
  readonly message: string;
  readonly hostname: string;
  readonly processId: number;
  readonly data?: TObject;
  //readonly context?: TExtendedRecord;
  //readonly object?: TObject;
};

type TLogParameters<
  TObject extends Record<string | number | symbol, unknown> = {},
> = Pick<TLogEntry<TObject>, "level" | "message"> & {
  readonly object?: TObject;
};

type TForkParameters = {
  readonly context?: TExtendedRecord;
};

type TMemoized = {
  hostname: string;
};

/**
 * Logger class for handling application logging with multiple transports
 */
class Logger {
  private readonly _options: TLoggerOptions;
  private readonly _memoized: TMemoized;
  private readonly _context?: TExtendedRecord;
  private readonly _redact?: ReturnType<typeof fastRedact>;

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
    this._memoized = {
      hostname: hostname(),
    };

    if (options.redact) {
      this._redact = fastRedact({ ...options.redact, serialize: false });
    }
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
        time: new Date(),
        hostname: this._memoized.hostname,
        processId: process.pid,
        data:
          object || this._context
            ? this._redact
              ? <TExtendedRecord>this._redact<TExtendedRecord>({
                  ...object,
                  ...this._context,
                })
              : {
                  ...object,
                  ...this._context,
                }
            : undefined,
      });
    }
  }

  /**
   * Logs a trace level message
   * @param message - The message to log
   */
  trace<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "TRACE", object });
  }

  //#region Shorthand methods for log levels.
  debug<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "DEBUG", object });
  }

  info<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "INFO", object });
  }

  warn<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "WARN", object });
  }

  error<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "ERROR", object });
  }

  fatal<TObject extends Record<string | number | symbol, unknown>>(
    message: string,
    object?: TObject
  ) {
    this._log({ message, level: "FATAL", object });
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
