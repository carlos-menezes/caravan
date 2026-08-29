import { defaultLevel, defaultLevelOrdering, defaultLevels, type TDefaultLevels } from "./level";
import type { TTransport, TLogRecord } from "./transport.ts";

// Private keys used to attach internal state to TLogger without exposing it on the public surface.
const TRANSPORTS_SYMBOL: unique symbol = Symbol("TRANSPORTS");
const CONTEXT_SYMBOL: unique symbol = Symbol("CONTEXT");
const MIDDLEWARE_SYMBOL: unique symbol = Symbol("MIDDLEWARE");

/** Transforms a record before it reaches transports, or drops it by returning undefined. */
export type TLogMiddleware = (record: TLogRecord) => TLogRecord | undefined;

/** Controls which parts of a parent logger a child logger created with `inherit` picks up. */
type TInheritOptions<
  TParentLevel extends TDefaultLevels,
  TInheritedContext extends object,
  TKeepContext extends boolean = true,
> = {
  /** The parent logger to inherit from. */
  from: TLogger<TParentLevel, TInheritedContext>;
  /** Merge the parent's context into this logger's context. Defaults to true. */
  context?: TKeepContext;
  /** Include the parent's transports. Defaults to true. */
  transports?: boolean;
  /** Include the parent's middleware. Defaults to true. */
  middleware?: boolean;
};

/** The effective context type of a logger once parent inheritance is factored in. */
type TResolvedContext<
  TContext extends object,
  TInheritedContext extends object,
  TKeepContext extends boolean,
> = (TKeepContext extends false ? object : TInheritedContext) & TContext;

/** Options accepted by {@link createLogger}. */
type TCreateLoggerOptions<
  TParentLevel extends TDefaultLevels = typeof defaultLevel,
  TLevel extends TDefaultLevels = TParentLevel,
  TContext extends object = object,
  TInheritedContext extends object = object,
  TKeepContext extends boolean = true,
> = {
  /** Parent logger to derive level, transports, context and/or middleware from. */
  inherit?: TInheritOptions<TParentLevel, TInheritedContext, TKeepContext>;
  /** Minimum level a record must meet to be sent to transports. Defaults to the parent's level, or "INFO". */
  level?: TLevel;
  /** Destinations records are dispatched to. */
  transports?: TTransport[];
  /** Merged into every record this logger writes. */
  context?: TContext;
  /** Runs on every record, in order, before it reaches transports. */
  middleware?: TLogMiddleware[];
};

/** Fully resolved options used internally once inheritance and defaults have been applied. */
type TResolvedLoggerOptions<TLevel extends TDefaultLevels, TContext extends object = object> = {
  id: string;
  level: TLevel;
  transports: TTransport[];
  context?: TContext;
  middleware: TLogMiddleware[];
};

/** Logs a message, a context object, or both, at a level fixed by the calling method. */
type TLogFn = {
  (message: string): void;
  <TExtraContext extends object>(context: TExtraContext): void;
  <TExtraContext extends object>(message: string, context: TExtraContext): void;
};

/** A logger created by {@link createLogger}, exposing one log method per level. */
export type TLogger<
  TLevel extends TDefaultLevels = typeof defaultLevel,
  TContext extends object = object,
> = {
  /** Identifies this logger in every record it produces. */
  id: string;
  /** Minimum level a record must meet to be sent to transports. */
  level: TLevel;
  /** Awaits all pending transport writes. */
  flush: () => Promise<void>;
  [TRANSPORTS_SYMBOL]: TTransport[];
  [CONTEXT_SYMBOL]: TContext | undefined;
  [MIDDLEWARE_SYMBOL]: TLogMiddleware[];
} & { [K in TDefaultLevels as Lowercase<K>]: TLogFn };

/** Shallow-merges two optional context objects, returning undefined if both are absent. */
const mergeContext = (base?: object, extra?: object): object | undefined =>
  base === undefined && extra === undefined ? undefined : { ...base, ...extra };

/** Builds a record, runs it through middleware, and dispatches it to transports unless dropped. */
const sendLogRecord = (
  options: TResolvedLoggerOptions<TDefaultLevels>,
  level: TDefaultLevels,
  messageOrContext: string | object,
  context?: object,
): void => {
  if (defaultLevelOrdering[level] < defaultLevelOrdering[options.level]) {
    return;
  }

  const message = typeof messageOrContext === "string" ? messageOrContext : "";

  const extraContext = typeof messageOrContext === "string" ? context : messageOrContext;

  let record: TLogRecord | undefined = {
    id: options.id,
    level,
    time: Date.now(),
    context: mergeContext(options.context, extraContext),
    message,
  };

  for (const middleware of options.middleware) {
    record = middleware(record);
    if (record === undefined) {
      return;
    }
  }

  for (const transport of options.transports) {
    transport.send(record);
  }
};

/** Creates a logger with an explicit `id`, optionally inheriting level, transports, context and/or middleware from a parent. */
export function createLogger<
  TParentLevel extends TDefaultLevels = typeof defaultLevel,
  TLevel extends TDefaultLevels = TParentLevel,
  TContext extends object = object,
  TInheritedContext extends object = object,
  TKeepContext extends boolean = true,
>(
  id: string,
  options?: TCreateLoggerOptions<TParentLevel, TLevel, TContext, TInheritedContext, TKeepContext>,
): TLogger<TLevel, TResolvedContext<TContext, TInheritedContext, TKeepContext>>;
/** Creates a logger that inherits from a parent, reusing the parent's `id`. */
export function createLogger<
  TParentLevel extends TDefaultLevels = typeof defaultLevel,
  TLevel extends TDefaultLevels = TParentLevel,
  TContext extends object = object,
  TInheritedContext extends object = object,
  TKeepContext extends boolean = true,
>(
  options: TCreateLoggerOptions<TParentLevel, TLevel, TContext, TInheritedContext, TKeepContext> & {
    inherit: TInheritOptions<TParentLevel, TInheritedContext, TKeepContext>;
  },
): TLogger<TLevel, TResolvedContext<TContext, TInheritedContext, TKeepContext>>;
export function createLogger<
  TParentLevel extends TDefaultLevels = typeof defaultLevel,
  TLevel extends TDefaultLevels = TParentLevel,
  TContext extends object = object,
  TInheritedContext extends object = object,
  TKeepContext extends boolean = true,
>(
  idOrOptions:
    | string
    | (TCreateLoggerOptions<TParentLevel, TLevel, TContext, TInheritedContext, TKeepContext> & {
        inherit: TInheritOptions<TParentLevel, TInheritedContext, TKeepContext>;
      }),
  maybeOptions?: TCreateLoggerOptions<
    TParentLevel,
    TLevel,
    TContext,
    TInheritedContext,
    TKeepContext
  >,
): TLogger<TLevel, TResolvedContext<TContext, TInheritedContext, TKeepContext>> {
  const options = typeof idOrOptions === "string" ? maybeOptions : idOrOptions;
  const parent = options?.inherit?.from;
  const id = typeof idOrOptions === "string" ? idOrOptions : parent?.id;
  if (id === undefined) {
    throw new Error("createLogger requires an id unless inheriting from a parent logger");
  }
  const keepTransports = options?.inherit?.transports ?? true;
  const keepContext = options?.inherit?.context ?? true;
  const keepMiddleware = options?.inherit?.middleware ?? true;

  const resolvedOptions = {
    id,
    level: (options?.level ?? parent?.level ?? defaultLevel) as TLevel,
    transports: [
      ...(options?.transports ?? []),
      ...(keepTransports ? (parent?.[TRANSPORTS_SYMBOL] ?? []) : []),
    ],
    context: mergeContext(keepContext ? parent?.[CONTEXT_SYMBOL] : undefined, options?.context) as
      | TResolvedContext<TContext, TInheritedContext, TKeepContext>
      | undefined,
    middleware: [
      ...(keepMiddleware ? (parent?.[MIDDLEWARE_SYMBOL] ?? []) : []),
      ...(options?.middleware ?? []),
    ],
  } satisfies TResolvedLoggerOptions<
    TLevel,
    TResolvedContext<TContext, TInheritedContext, TKeepContext>
  >;

  const logFns = Object.fromEntries(
    defaultLevels.map((level) => {
      const log: TLogFn = (messageOrContext: string | object, context?: object) => {
        sendLogRecord(resolvedOptions, level, messageOrContext, context);
      };

      return [level.toLowerCase(), log];
    }),
  ) as { [K in TDefaultLevels as Lowercase<K>]: TLogFn };

  return {
    id: resolvedOptions.id,
    level: resolvedOptions.level,
    flush: async () => {
      await Promise.all(resolvedOptions.transports.map((transport) => transport.flush()));
    },
    ...logFns,
    [CONTEXT_SYMBOL]: resolvedOptions.context,
    [TRANSPORTS_SYMBOL]: resolvedOptions.transports,
    [MIDDLEWARE_SYMBOL]: resolvedOptions.middleware,
  };
}
