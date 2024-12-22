import { NoTransportsError } from "./error";
import { LogLevelMap, TLogLevel } from "./level";
import { Transport } from "./transport";
import { hostname } from "os";

type TLoggerOptions = {
  readonly level: TLogLevel;
  readonly transports: Array<Transport>;
};

type TLogEntry = {
  readonly level: TLogLevel;
  readonly timestamp: number;
  readonly message: string;
  readonly hostname: string;
  readonly processId: number;
};

type TLogParameters = Pick<TLogEntry, "level" | "message">;

/**
 * Logger class for handling application logging with multiple transports
 */
class Logger {
  private readonly _options: TLoggerOptions;

  /**
   * Creates a new Logger instance
   * @param options - Configuration options for the logger
   */
  constructor(options: TLoggerOptions) {
    this._options = options;
  }

  private _log({ level, message }: TLogParameters) {
    if (this._options.transports.length === 0) {
      throw new NoTransportsError();
    }

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
        timestamp: Date.now(),
        hostname: hostname(),
        processId: process.pid,
      });
    }
  }

  /**
   * Logs a debug level message
   * @param message - The message to log
   */
  debug(message: string) {
    this._log({ message, level: "debug" });
  }

  //#region Shorthand methods for log levels.
  info(message: string) {
    this._log({ message, level: "info" });
  }

  warn(message: string) {
    this._log({ message, level: "warn" });
  }

  error(message: string) {
    this._log({ message, level: "error" });
  }
  //#endregion
}

export { Logger };
export type { TLogEntry };
