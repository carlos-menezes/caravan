/** Log levels ordered from least to most severe. */
export const defaultLevels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"] as const;

/** Union of the built-in log level names. */
export type TDefaultLevels = (typeof defaultLevels)[number];

/** Maps each level name to its numeric severity index, for level comparisons. */
export const defaultLevelOrdering = Object.entries(defaultLevels).reduce(
  (acc, [index, level]) => {
    acc[level] = Number(index);
    return acc;
  },
  {} as Record<TDefaultLevels, number>,
);

/** The default log level. */
export const defaultLevel: TDefaultLevels = "INFO";
