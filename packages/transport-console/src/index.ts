import {
  Transport,
  type TLogEntry,
  type TTransportBaseConstructorOptions,
} from "@caravan-logger/logger";
import chalk from "chalk";
import { levelColors } from "./constants";

type TConsoleTransportOptions = {
  readonly pretty?: boolean;
};

class ConsoleTransport extends Transport<TConsoleTransportOptions> {
  constructor(
    options: TTransportBaseConstructorOptions<TConsoleTransportOptions>
  ) {
    super(options);
  }

  async handle({
    level,
    message,
    object,
    hostname,
    processId,
    date,
    context,
  }: TLogEntry): Promise<void> {
    const output = this.options.pretty
      ? this._formatPrettyOutput({
          level,
          message,
          object,
          hostname,
          processId,
          date,
          context,
        })
      : JSON.stringify({
          level,
          message,
          hostname,
          processId,
          date,
          ...context,
          ...object,
        });

    console.log(output);
  }

  private _formatPrettyOutput({
    level,
    message,
    object,
    hostname,
    processId,
    date,
    context,
  }: TLogEntry): string {
    const coloredLevel = (levelColors[level] || chalk.white)(
      level.toUpperCase()
    );
    const coloredTimestamp = date.toISOString();
    const coloredHost = `${hostname}:${processId}`;
    const coloredMessage = chalk.cyan(message);

    const metadata = { ...context, ...object };
    const prettyMetadata = Object.keys(metadata).length
      ? "\n" + JSON.stringify(metadata, null, 2)
      : "";

    return `${coloredTimestamp} ${coloredLevel} ${coloredHost} ${coloredMessage}${prettyMetadata}`;
  }
}

export { ConsoleTransport };
