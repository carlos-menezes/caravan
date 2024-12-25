import { LoggerError } from "@caravan-logger/logger";

type TCouldNotWriteToFileErrorContext = {
  readonly path: string;
};

class CouldNotWriteToFileError extends LoggerError<TCouldNotWriteToFileErrorContext> {
  constructor({ path }: TCouldNotWriteToFileErrorContext) {
    super({
      message: `Could not write to file. Do you have write permissions to the specified path?`,
      context: { path },
    });
  }
}

export { CouldNotWriteToFileError };
