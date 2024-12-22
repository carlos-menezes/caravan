import {
  Transport,
  type TLogEntry,
  type TTransportBaseConstructorOptions,
} from "caravan-logger";

type TConsoleTransportOptions = {
  readonly pretty?: boolean;
};

class ConsoleTransport extends Transport<TConsoleTransportOptions> {
  constructor(
    options?: TTransportBaseConstructorOptions<TConsoleTransportOptions>
  ) {
    super(options);
  }

  async handle(entry: TLogEntry): Promise<void> {
    const output = this.options.pretty
      ? `${entry.timestamp} ${entry.level.padEnd(5)} ${entry.hostname}:${entry.processId} - ${entry.message}`
      : JSON.stringify(entry);

    console.log(output);
  }
}

export { ConsoleTransport };
