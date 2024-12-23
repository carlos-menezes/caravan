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
  readonly output: string;
};

type TFileTransportOptions = {
  readonly path: string;
  readonly hooks?: {
    readonly onError?: ({
      error,
      output,
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
    object,
    hostname,
    processId,
    date,
    context,
  }: TLogEntry): Promise<void> {
    const metadata =
      context || object ? JSON.stringify({ ...context, ...object }) : "";
    const output = `${date.toISOString()} ${level.toUpperCase()} ${hostname}:${processId} ${message} ${metadata}\n`;

    try {
      await writeFile(this.options.path, output, { flag: "a" });
    } catch (error) {
      if (error instanceof Error) {
        await this.options.hooks?.onError?.({ error, output });
      }
    }
  }
}

export { FileTransport };
