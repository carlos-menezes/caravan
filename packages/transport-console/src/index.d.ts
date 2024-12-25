import { Transport, type TLogEntry, type TTransportBaseConstructorOptions } from "@caravan-logger/logger";
type TConsoleTransportOptions = {
    readonly pretty?: boolean;
};
declare class ConsoleTransport extends Transport<TConsoleTransportOptions> {
    constructor(options: TTransportBaseConstructorOptions<TConsoleTransportOptions>);
    handle({ level, message, data, hostname, processId, time, }: TLogEntry): Promise<void>;
    private _formatPrettyOutput;
}
export { ConsoleTransport };
