import { TLogLevel } from "@caravan-logger/logger/dist/level";
import { SeverityNumber } from "@opentelemetry/api-logs";

const SeverityNumberMap = {
  TRACE: SeverityNumber.TRACE,
  DEBUG: SeverityNumber.DEBUG,
  INFO: SeverityNumber.INFO,
  WARN: SeverityNumber.WARN,
  ERROR: SeverityNumber.ERROR,
  FATAL: SeverityNumber.FATAL,
} as const satisfies Record<TLogLevel, SeverityNumber>;

export { SeverityNumberMap };
