import { TLogLevel } from "@caravan-logger/logger/dist/level";
import chalk, { ChalkInstance } from "chalk";

const levelColors = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.blue,
  debug: chalk.gray,
} as const satisfies Record<TLogLevel, ChalkInstance>;

export { levelColors };
