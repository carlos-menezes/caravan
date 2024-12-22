type TLogLevel = "debug" | "info" | "warn" | "error";

const LogLevelMap = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const satisfies Record<TLogLevel, number>;

class Level {
  static getValue(level: TLogLevel) {
    return LogLevelMap[level];
  }

  static get default(): TLogLevel {
    return "debug";
  }
}

export { LogLevelMap, Level };
export type { TLogLevel };
