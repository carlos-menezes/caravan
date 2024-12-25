import { Logger, type TLogEntry } from "./logger";
import {
  Transport,
  type TTransportBaseConstructorOptions,
  type TTransportBaseOptions,
} from "./transport";
import { LoggerError } from "./error";
import { Level, LogLevelMap } from "./level";

export { Logger, Transport, LoggerError, Level, LogLevelMap };
export type {
  TLogEntry,
  TTransportBaseConstructorOptions,
  TTransportBaseOptions,
};
