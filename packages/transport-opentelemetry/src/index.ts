import {
  Transport,
  TTransportBaseConstructorOptions,
  type TLogEntry,
} from "@caravan-logger/logger";
import { AnyValueMap, LogRecord } from "@opentelemetry/api-logs";
import {
  getOtlpLogger,
  Options as OpenTelemetryLoggerOptions,
} from "otlp-logger";
import { SeverityNumberMap } from "./transforms";

type TOpenTelemetryTransportOptions = OpenTelemetryLoggerOptions & {};

class OpenTelemetryTransport extends Transport<TOpenTelemetryTransportOptions> {
  private readonly _otlpLogger: ReturnType<typeof getOtlpLogger>;

  constructor({
    options,
    level,
  }: TTransportBaseConstructorOptions<TOpenTelemetryTransportOptions>) {
    super({ options, level });

    this._otlpLogger = getOtlpLogger({
      loggerName: options.loggerName,
      serviceVersion: options.serviceVersion,
      logRecordProcessorOptions: options.logRecordProcessorOptions,
      resourceAttributes: options.resourceAttributes,
    });
  }

  async handle(entry: TLogEntry): Promise<void> {
    const log = this._transform(entry);

    this._otlpLogger.emit(log);
  }

  private _transform({ level, time, message, data }: TLogEntry): LogRecord {
    return {
      severityNumber: SeverityNumberMap[level],
      severityText: level,
      timestamp: time,
      body: message,
      attributes: data as AnyValueMap,
    };
  }
}

export { OpenTelemetryTransport };
