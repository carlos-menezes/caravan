import { Transport, type TLogEntry, type TTransportBaseConstructorOptions } from "@caravan-logger/logger";
import { BetterStackError } from "./error";
type TOnErrorHookParameters = {
    readonly error: BetterStackError;
    readonly log: TLogEntry;
};
type TBetterStackTransportOptions = {
    readonly sourceToken: string;
    readonly hooks?: {
        readonly onError?: ({ error, log, }: TOnErrorHookParameters) => Promise<void>;
    };
};
declare class BetterStackTransport extends Transport<TBetterStackTransportOptions> {
    constructor(options: TTransportBaseConstructorOptions<TBetterStackTransportOptions>);
    handle({ level, message, data, hostname, processId, time, }: TLogEntry): Promise<void>;
}
export { BetterStackTransport };
