import {
  Transport,
  type TLogEntry,
  type TTransportBaseConstructorOptions,
} from "@caravan-logger/logger";
import { writeFile } from "fs/promises";
import { CouldNotWriteToFileError } from "./error";
import { writeFileSync } from "fs";

type TOnErrorHookParameters = {
  readonly error: Error;
  readonly log: TLogEntry;
};

type TFileTransportOptions = {
  readonly path: string;
  readonly hooks?: {
    readonly onError?: ({
      error,
      log,
    }: TOnErrorHookParameters) => Promise<void>;
  };
};

class FileTransport extends Transport<TFileTransportOptions> {
  constructor(
    options: TTransportBaseConstructorOptions<TFileTransportOptions>
  ) {
    super(options);

    try {
      writeFileSync(options.options.path, "", { flag: "a" });
    } catch (error) {
      throw new CouldNotWriteToFileError({
        path: options.options.path,
      });
    }
  }

  async handle({
    level,
    message,
    hostname,
    processId,
    time,
    data,
  }: TLogEntry): Promise<void> {
    const object = data ? JSON.stringify(data) : "";
    const output = `${time.toISOString()} ${level.toUpperCase()} ${hostname}:${processId} ${message} ${object}\n`;

    try {
      await writeFile(this.options.path, output, { flag: "a" });
    } catch (error) {
      if (error instanceof Error) {
        await this.options.hooks?.onError?.({
          error,
          log: { level, message, data, hostname, processId, time },
        });
      }
    }
  }
}

export { FileTransport };
