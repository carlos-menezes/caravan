import {
  createTransport,
  TLogRecord,
  type TCreateTransportBaseConfiguration,
  type TDefaultLevels,
} from "@caravan-logger/logger";

/** Datadog site to send logs to. Determines the intake endpoint's domain. */
export type TDatadogSite =
  | "datadoghq.com"
  | "datadoghq.eu"
  | "us3.datadoghq.com"
  | "us5.datadoghq.com"
  | "ap1.datadoghq.com"
  | "ap2.datadoghq.com"
  | "ddog-gov.com"
  | (string & {});

export type TCreateDatadogTransportConfiguration = TCreateTransportBaseConfiguration & {
  /** Datadog API key used to authenticate with the Logs intake API. */
  apiKey: string;
  /** Datadog site to send logs to. Defaults to "datadoghq.com". */
  site?: TDatadogSite;
  /** Overrides the intake URL entirely, ignoring `site`. Useful for proxies or testing. */
  url?: string;
  /** Value reported as `service` on each log entry. */
  service?: string;
  /** Value reported as `ddsource` on each log entry. Defaults to "caravan-logger". */
  ddsource?: string;
  /** Value reported as `hostname` on each log entry. */
  hostname?: string;
  /** Tags applied to every log entry, as a "key:value" array or a key/value record. */
  tags?: string[] | Record<string, string | number | boolean>;
  /** Maps a log record to a Datadog log entry. Overrides the default mapping. */
  format?: (record: TLogRecord) => Record<string, unknown>;
  /** Number of records buffered before a batch is sent. Defaults to 1 (send immediately). */
  batchSize?: number;
  /** Interval, in milliseconds, at which buffered records are sent regardless of `batchSize`. */
  flushInterval?: number;
  /** Fetch implementation used to call the Datadog intake API. Defaults to the global `fetch`. */
  fetch?: typeof fetch;
};

const formatTags = (tags: string[] | Record<string, string | number | boolean>): string =>
  Array.isArray(tags)
    ? tags.join(",")
    : Object.entries(tags)
        .map(([key, value]) => `${key}:${String(value)}`)
        .join(",");

const formatStatus = (level: TDefaultLevels): string => level.toLowerCase();

const defaultFormat = (
  record: TLogRecord,
  configuration: TCreateDatadogTransportConfiguration,
): Record<string, unknown> => ({
  ...record.context,
  message: record.message,
  status: formatStatus(record.level),
  timestamp: record.time,
  ddsource: configuration.ddsource ?? "caravan-logger",
  ...(configuration.service !== undefined ? { service: configuration.service } : {}),
  ...(configuration.hostname !== undefined ? { hostname: configuration.hostname } : {}),
  ...(configuration.tags !== undefined ? { ddtags: formatTags(configuration.tags) } : {}),
});

/**
 * Creates a transport that sends log records to Datadog's Logs API
 * (https://docs.datadoghq.com/api/latest/logs/).
 *
 * @param configuration - The configuration for the Datadog transport.
 * @returns A transport that sends log records to Datadog.
 */
export const createDatadogTransport = (configuration: TCreateDatadogTransportConfiguration) => {
  const url =
    configuration.url ??
    `https://http-intake.logs.${configuration.site ?? "datadoghq.com"}/api/v2/logs`;
  const batchSize = configuration.batchSize ?? 1;
  const fetchImplementation = configuration.fetch ?? fetch;

  let buffer: Record<string, unknown>[] = [];

  const sendBatch = async (): Promise<void> => {
    if (buffer.length === 0) {
      return;
    }

    const batch = buffer;
    buffer = [];

    const response = await fetchImplementation(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": configuration.apiKey,
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw new Error(
        `Datadog transport failed to send logs: ${response.status} ${response.statusText}`,
      );
    }
  };

  const timer = configuration.flushInterval
    ? setInterval(() => void sendBatch(), configuration.flushInterval)
    : undefined;
  timer?.unref?.();

  return createTransport<TCreateDatadogTransportConfiguration>(
    {
      write: async (record) => {
        const entry = configuration.format
          ? configuration.format(record)
          : defaultFormat(record, configuration);
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
