import {
  LoggerError,
  Transport,
  type TLogEntry,
  type TTransportBaseConstructorOptions,
} from "@caravan-logger/logger";
import {
  CouldNotWriteToBetterStackError,
  BetterStackError,
  CouldNotFetchBetterStackError,
} from "./error";

type TOnErrorHookParameters = {
  readonly error: BetterStackError;
  readonly log: TLogEntry;
};

// https://docs.BetterStackhq.com/api/latest/logs/
type TBetterStackTransportOptions = {
  readonly sourceToken: string;
  readonly hooks?: {
    readonly onError?: ({
      error,
      log,
    }: TOnErrorHookParameters) => Promise<void>;
  };
};

class BetterStackTransport extends Transport<TBetterStackTransportOptions> {
  constructor(
    options: TTransportBaseConstructorOptions<TBetterStackTransportOptions>
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
    const body = {
      level,
      message,
      ...data,
      dt: time.toISOString(),
      hostname,
      processId,
    };

    try {
      const request = await fetch("https://in.logs.betterstack.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.options.sourceToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!request.ok)
        this.options.hooks?.onError?.({
          error: new CouldNotWriteToBetterStackError({
            statusCode: request.status,
          }),
          log: {
            level,
            message,
            data,
            hostname,
            processId,
            time,
          },
        });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        this.options.hooks?.onError?.({
          error: new CouldNotFetchBetterStackError({ error }),
          log: {
            level,
            message,
            data,
            hostname,
            processId,
            time,
          },
        });
      }
    }
  }
}

export { BetterStackTransport };
