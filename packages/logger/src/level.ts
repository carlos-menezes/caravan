const LogLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type TLogLevel = keyof typeof LogLevels;

class Level {
  static getValue(level: TLogLevel) {
    return LogLevels[level];
  }

  static get default(): TLogLevel {
    return "DEBUG";
  }
}

export { LogLevels as LogLevelMap, Level };
export type { TLogLevel };
