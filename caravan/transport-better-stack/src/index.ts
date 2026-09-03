import {
  createBatcher,
  createTransport,
  TLogRecord,
  type TBatchableConfiguration,
  type TCreateTransportBaseConfiguration,
  type TDefaultLevels,
} from "@caravan-logger/logger";

export type TCreateBetterStackTransportConfiguration = TCreateTransportBaseConfiguration &
  TBatchableConfiguration & {
    /** Better Stack source token used to authenticate with the Logs ingesting API. */
    sourceToken: string;
    /** Ingesting host for the source, found on the source's page. Each source has its own host. */
    endpoint: string;
    /** Maps a log record to a Better Stack log entry. Overrides the default mapping. */
    format?: (record: TLogRecord) => Record<string, unknown>;
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
  const fetchImplementation = configuration.fetch ?? fetch;

  const batcher = createBatcher<Record<string, unknown>>({
    size: configuration.batchConfiguration?.size ?? configuration.batchSize,
    flushInterval: configuration.batchConfiguration?.flushInterval ?? configuration.flushInterval,
    sendBatch: async (batch) => {
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
    },
  });

  return createTransport<TCreateBetterStackTransportConfiguration>(
    {
      write: async (record) => {
        const entry = configuration.format ? configuration.format(record) : defaultFormat(record);
        await batcher.push(entry);
      },
      flush: () => batcher.flush(),
    },
    configuration,
  );
};
