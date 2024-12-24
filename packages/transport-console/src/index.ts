import {
  Level,
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
    data,
    hostname,
    processId,
    time,
  }: TLogEntry): Promise<void> {
    const output = this.options.pretty
      ? this._formatPrettyOutput({
          level,
          message,
          data,
          hostname,
          processId,
          time,
        })
      : JSON.stringify({
          level,
          message,
          hostname,
          processId,
          time,
          ...data,
        });

    console.log(output);
  }

  private _formatPrettyOutput({
    level,
    message,
    data,
    hostname,
    processId,
    time,
  }: TLogEntry): string {
    const coloredLevel = (levelColors[level] || chalk.white)(
      level.padEnd(Level.maximumLevelLength)
    );
    const coloredTimestamp = time.toISOString();
    const coloredHost = `${hostname}:${processId}`;
    const coloredMessage = chalk.cyan(message);

    const prettyMetadata = data ? "\n" + JSON.stringify(data, null, 2) : "";

    return `${coloredTimestamp} ${coloredLevel} ${coloredHost} ${coloredMessage}${prettyMetadata}`;
  }
}

export { ConsoleTransport };
