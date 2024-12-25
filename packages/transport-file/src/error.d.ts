import { LoggerError } from "@caravan-logger/logger";
type TCouldNotWriteToFileErrorContext = {
    readonly path: string;
};
declare class CouldNotWriteToFileError extends LoggerError<TCouldNotWriteToFileErrorContext> {
    constructor({ path }: TCouldNotWriteToFileErrorContext);
}
export { CouldNotWriteToFileError };
