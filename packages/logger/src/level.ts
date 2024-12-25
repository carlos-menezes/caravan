const LogLevels = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5,
} as const;

type TLogLevel = keyof typeof LogLevels;

class Level {
  static get default(): TLogLevel {
    return "DEBUG";
  }

  static get maximumLevelLength(): number {
    return Object.keys(LogLevels).reduce((max, level) => {
      return Math.max(max, level.length);
    }, 0);
  }
}

export { LogLevels as LogLevelMap, Level };
export type { TLogLevel };
