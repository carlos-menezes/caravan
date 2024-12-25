import { Transport, type TLogEntry, type TTransportBaseConstructorOptions } from "@caravan-logger/logger";
type TOnErrorHookParameters = {
    readonly error: Error;
    readonly log: TLogEntry;
};
type TFileTransportOptions = {
    readonly path: string;
    readonly hooks?: {
        readonly onError?: ({ error, log, }: TOnErrorHookParameters) => Promise<void>;
    };
};
declare class FileTransport extends Transport<TFileTransportOptions> {
    constructor(options: TTransportBaseConstructorOptions<TFileTransportOptions>);
    handle({ level, message, hostname, processId, time, data, }: TLogEntry): Promise<void>;
}
export { FileTransport };
