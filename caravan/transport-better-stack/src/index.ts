import {
  createTransport,
  TLogRecord,
  type TCreateTransportBaseConfiguration,
  type TDefaultLevels,
} from "@caravan-logger/logger";

export type TCreateBetterStackTransportConfiguration = TCreateTransportBaseConfiguration & {
  /** Better Stack source token used to authenticate with the Logs ingesting API. */
  sourceToken: string;
  /** Ingesting host for the source, found on the source's page. Each source has its own host. */
  endpoint: string;
  /** Maps a log record to a Better Stack log entry. Overrides the default mapping. */
  format?: (record: TLogRecord) => Record<string, unknown>;
  /** Number of records buffered before a batch is sent. Defaults to 1 (send immediately). */
  batchSize?: number;
  /** Interval, in milliseconds, at which buffered records are sent regardless of `batchSize`. */
  flushInterval?: number;
  /** Fetch implementation used to call the ingesting API. Defaults to the global `fetch`. */
  fetch?: typeof fetch;
};

const formatLevel = (level: TDefaultLevels): string => level.toLowerCase();

const defaultFormat = (record: TLogRecord): Record<string, unknown> => ({
  ...record.context,
  message: record.message,
  level: formatLevel(record.level),
  dt: new Date(record.time).toISOString(),
});

/**
 * Creates a transport that sends log records to Better Stack's Logs ingesting API
 * (https://betterstack.com/docs/logs/http-rest-api/).
 *
 * @param configuration - The configuration for the Better Stack transport.
 * @returns A transport that sends log records to Better Stack.
 */
export const createBetterStackTransport = (
  configuration: TCreateBetterStackTransportConfiguration,
) => {
  const endpoint = configuration.endpoint;
  const batchSize = configuration.batchSize ?? 1;
  const fetchImplementation = configuration.fetch ?? fetch;

  let buffer: Record<string, unknown>[] = [];

  const sendBatch = async (): Promise<void> => {
    if (buffer.length === 0) {
      return;
    }

    const batch = buffer;
    buffer = [];

    const response = await fetchImplementation(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${configuration.sourceToken}`,
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw new Error(
        `Better Stack transport failed to send logs: ${response.status} ${response.statusText}`,
      );
    }
  };

  const timer = configuration.flushInterval
    ? setInterval(() => void sendBatch(), configuration.flushInterval)
    : undefined;
  timer?.unref?.();

  return createTransport<TCreateBetterStackTransportConfiguration>(
    {
      write: async (record) => {
        const entry = configuration.format ? configuration.format(record) : defaultFormat(record);
        buffer.push(entry);

        if (buffer.length >= batchSize) {
          await sendBatch();
        }
      },
      flush: async () => {
        await sendBatch();
      },
    },
    configuration,
  );
};
