import { LoggerError } from "@caravan-logger/logger";
type TBetterStackErrorContext = {
    readonly statusCode: number;
};
type TBetterStackErrorConstructorParameters = {
    readonly message: string;
    readonly context: TBetterStackErrorContext;
};
declare abstract class BetterStackError extends LoggerError<TBetterStackErrorContext> {
    constructor({ message, context }: TBetterStackErrorConstructorParameters);
}
declare class CouldNotWriteToBetterStackError extends BetterStackError {
    constructor({ statusCode }: TBetterStackErrorContext);
}
export { BetterStackError, CouldNotWriteToBetterStackError };
