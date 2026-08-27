import { defaultLevelOrdering, TDefaultLevels } from "./level";

/** A single structured log entry dispatched to transports. */
export type TLogRecord<TContext extends object = object> = {
  id: string;
  level: TDefaultLevels;
  time: number;
  context?: TContext;
  message: string;
};

/** Writes a single record to the transport's destination. */
type TTransportHandler = (record: TLogRecord) => void | Promise<void>;

/** Implementation hooks passed to {@link createTransport}. */
type TCreateTransportArgs = {
  write: TTransportHandler;
  /** Called on flush(), after all pending writes have been awaited. */
  flush?: () => void | Promise<void>;
};

/** A destination records are dispatched to, created via {@link createTransport}. */
export type TTransport<TTransportConfiguration extends object | undefined = object | undefined> = {
  /** Records below this level are dropped before write() runs. Undefined means it inherits the logger's level. */
  level: TDefaultLevels | undefined;
  /** Queues a record for writing, dropping it first if it's below level. */
  send: (record: TLogRecord) => void;
  /** Awaits all pending writes, rethrowing the first write error, if any. */
  flush: () => Promise<void>;
  /** The configuration this transport was created with, if any. */
  configuration: TTransportConfiguration | undefined;
};

/** Base configuration every transport configuration should extend. */
export type TCreateTransportBaseConfiguration = {
  /** Records below this level are dropped before write() runs. Defaults to the logger's level. */
  level?: TDefaultLevels;
};

/** Creates a transport that tracks pending writes so flush() can await them and surface write errors. */
export const createTransport = <
  TTransportConfiguration extends TCreateTransportBaseConfiguration | undefined = undefined,
>(
  args: TCreateTransportArgs,
  ...configuration: [TTransportConfiguration] extends [object] ? [TTransportConfiguration] : []
): TTransport<TTransportConfiguration> => {
  const pending = new Set<Promise<void>>();
  let writeError: unknown;
  const level = configuration[0]?.level;

  return {
    level,
    send: (record) => {
      if (level !== undefined && defaultLevelOrdering[record.level] < defaultLevelOrdering[level]) {
        return;
      }

      const write = Promise.resolve()
        .then(() => args.write(record))
        .catch((error: unknown) => {
          writeError ??= error;
        });

      pending.add(write);
      void write.finally(() => pending.delete(write));
    },
    flush: async () => {
      await Promise.resolve();
      await args.flush?.();
      await Promise.all(pending);

      if (writeError !== undefined) {
        throw writeError;
      }
    },
    configuration: configuration[0] as TTransportConfiguration | undefined,
  };
};
