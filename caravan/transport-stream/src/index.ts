import {
  createTransport,
  TLogRecord,
  type TCreateTransportBaseConfiguration,
} from "@caravan-logger/logger";
import type Stream from "node:stream";

export type TCreateStreamTransportConfiguration = TCreateTransportBaseConfiguration & {
  /** Writable stream log records are written to. */
  stream: Stream.Writable | WritableStream<string>;
  /** Optional function to format log records before writing them to the stream. */
  format?: (record: TLogRecord) => string;
  /** Line ending appended after each record. Defaults to "lf". */
  eol?: "lf" | "crlf";
};

const eolChars = { lf: "\n", crlf: "\r\n" } as const;

const isWebWritableStream = (
  stream: Stream.Writable | WritableStream<string>,
): stream is WritableStream<string> =>
  typeof (stream as WritableStream<string>).getWriter === "function";

const writeToNodeStream = (stream: Stream.Writable, chunk: string): Promise<void> =>
  new Promise((resolve, reject) => {
    stream.write(chunk, (error) => (error ? reject(error) : resolve()));
  });

const writeToWebStream = async (stream: WritableStream<string>, chunk: string): Promise<void> => {
  const writer = stream.getWriter();
  try {
    await writer.write(chunk);
  } finally {
    writer.releaseLock();
  }
};

const writeToStream = (
  stream: Stream.Writable | WritableStream<string>,
  chunk: string,
): Promise<void> =>
  isWebWritableStream(stream) ? writeToWebStream(stream, chunk) : writeToNodeStream(stream, chunk);

/**
 * Creates a transport that writes formatted log records to a writable stream.
 *
 * @param configuration - The configuration for the stream transport.
 * @returns A transport that writes log records to the configured stream.
 */
export const createStreamTransport = (configuration: TCreateStreamTransportConfiguration) => {
  return createTransport<TCreateStreamTransportConfiguration>(
    {
      write: async (record) => {
        const chunk = configuration.format ? configuration.format(record) : JSON.stringify(record);
        await writeToStream(configuration.stream, chunk + eolChars[configuration.eol ?? "lf"]);
      },
    },
    configuration,
  );
};
