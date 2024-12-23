import { TLogLevel } from "@caravan-logger/logger/dist/level";
import chalk, { ChalkInstance } from "chalk";

const levelColors = {
  error: chalk.bgRed,
  warn: chalk.bgYellow,
  info: chalk.bgGreenBright,
  debug: chalk.bgGray,
} as const satisfies Record<TLogLevel, ChalkInstance>;

export { levelColors };
