import { Level, TLogLevel } from "./level";
import { TExtendedRecord, TLogEntry } from "./logger";

type TTransportBaseConstructorOptions<
  TTransportConstructorOptions extends TExtendedRecord = TExtendedRecord,
> = {
  readonly level?: TLogLevel;
  readonly options: TTransportConstructorOptions;
};

type TTransportBaseOptions<
  TTransportOptions extends TExtendedRecord = TExtendedRecord,
> = {
  readonly level: TLogLevel;
  readonly options: TTransportOptions;
};

abstract class Transport<
  TTransportOptions extends TExtendedRecord = TExtendedRecord,
> {
  private readonly _level: TLogLevel;
  private readonly _options: TTransportOptions;

  constructor(options: TTransportBaseConstructorOptions<TTransportOptions>) {
    this._level = options?.level ?? Level.default;
    this._options = options?.options;
  }

  get level(): TLogLevel {
    return this._level;
  }

  get options(): TTransportOptions {
    return this._options;
  }

  abstract handle(entry: TLogEntry): Promise<void>;
}

export {
  Transport,
  type TTransportBaseConstructorOptions,
  type TTransportBaseOptions,
};
