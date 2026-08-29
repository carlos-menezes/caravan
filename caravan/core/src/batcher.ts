/** Tunes how a batchable transport buffers items before flushing them. */
export type TBatchConfiguration = {
  /** Number of items buffered before a flush runs. Defaults to 1 (flush immediately). */
  size?: number;
  /** Interval, in milliseconds, at which buffered items are flushed regardless of `size`. */
  flushInterval?: number;
};

/**
 * Mixed into a transport's configuration to declare whether it batches writes to its destination.
 * When `batch` is true, `batchConfiguration` tunes the buffering; otherwise batching is disabled.
 */
export type TBatchableConfiguration = (
  | { batch: true; batchConfiguration?: TBatchConfiguration }
  | { batch?: false; batchConfiguration?: never }
) & {
  /** @deprecated Use `batch: true` with `batchConfiguration.size` instead. */
  batchSize?: number;
  /** @deprecated Use `batch: true` with `batchConfiguration.flushInterval` instead. */
  flushInterval?: number;
};

/** Configuration for {@link createBatcher}. */
export type TCreateBatcherConfiguration<TItem> = TBatchConfiguration & {
  /** @deprecated Use `size` instead. */
  batchSize?: number;
  /** Sends a batch of buffered items to their destination. */
  sendBatch: (batch: TItem[]) => void | Promise<void>;
};

/** Buffers items and flushes them via `sendBatch`, in batches. */
export type TBatcher<TItem> = {
  /** Buffers an item, flushing immediately once the buffer reaches `size`. */
  push: (item: TItem) => Promise<void>;
  /** Sends any buffered items immediately, regardless of `size`. */
  flush: () => Promise<void>;
};

/**
 * Creates a batcher that buffers items and flushes them via `sendBatch`, either once `size`
 * items have been buffered, on `flushInterval`, or on an explicit `flush()` call. Used by
 * transports that batch writes to their destination (e.g. a database or an HTTP API).
 *
 * @param configuration - The configuration for the batcher.
 * @returns A batcher accepting items to be flushed in batches.
 */
export const createBatcher = <TItem>(
  configuration: TCreateBatcherConfiguration<TItem>,
): TBatcher<TItem> => {
  const size = configuration.size ?? configuration.batchSize ?? 1;
  let buffer: TItem[] = [];

  const flush = async (): Promise<void> => {
    if (buffer.length === 0) {
      return;
    }

    const batch = buffer;
    buffer = [];
    await configuration.sendBatch(batch);
  };

  const timer = configuration.flushInterval
    ? setInterval(() => void flush(), configuration.flushInterval)
    : undefined;
  timer?.unref?.();

  return {
    push: async (item) => {
      buffer.push(item);

      if (buffer.length >= size) {
        await flush();
      }
    },
    flush,
  };
};
