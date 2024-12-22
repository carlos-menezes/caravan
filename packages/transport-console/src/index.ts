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

  async handle({
    level,
    message,
    object,
    hostname,
    processId,
    timestamp,
    context,
  }: TLogEntry): Promise<void> {
    const output = this.options.pretty
      ? `${timestamp} ${level.padEnd(5)} ${hostname}:${processId} - ${message}\n${JSON.stringify({ ...context, ...object }, null, 2)}`
      : JSON.stringify({
          level,
          message,
          hostname,
          processId,
          timestamp,
          ...context,
          ...object,
        });

    console.log(output);
  }
}

export { ConsoleTransport };
