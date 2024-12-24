import { TLogLevel } from "@caravan-logger/logger/dist/level";
import chalk, { ChalkInstance } from "chalk";

const levelColors = {
  TRACE: chalk.gray,
  DEBUG: chalk.blue,
  INFO: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.redBright,
  FATAL: chalk.red,
} as const satisfies Record<TLogLevel, ChalkInstance>;

export { levelColors };
