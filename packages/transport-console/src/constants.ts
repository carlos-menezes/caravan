import { TLogLevel } from "@caravan-logger/logger/dist/level";
import chalk, { ChalkInstance } from "chalk";

const levelColors = {
  ERROR: chalk.bgRed,
  WARN: chalk.bgYellow,
  INFO: chalk.bgGreenBright,
  DEBUG: chalk.bgGray,
} as const satisfies Record<TLogLevel, ChalkInstance>;

export { levelColors };
