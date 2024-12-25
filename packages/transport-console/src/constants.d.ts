import { ChalkInstance } from "chalk";
declare const levelColors: {
    readonly TRACE: ChalkInstance;
    readonly DEBUG: ChalkInstance;
    readonly INFO: ChalkInstance;
    readonly WARN: ChalkInstance;
    readonly ERROR: ChalkInstance;
    readonly FATAL: ChalkInstance;
};
export { levelColors };
