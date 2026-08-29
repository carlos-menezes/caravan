import { afterEach, describe, expect, it, vi } from "vitest";

import { createBetterStackTransport } from "../src/index";

const TEST_ENDPOINT = "https://s1234.eu-nbg-2.betterstackdata.com";

const createMockFetch = (ok = true) => {
  const fetch = vi.fn(async () => ({
    ok,
    status: ok ? 202 : 500,
    statusText: ok ? "Accepted" : "Error",
  }));
  return fetch as unknown as typeof globalThis.fetch;
};

describe("createBetterStackTransport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends each record immediately by default", async () => {
    const fetch = createMockFetch();
    const transport = createBetterStackTransport({
      sourceToken: "test-token",
      endpoint: TEST_ENDPOINT,
      fetch,
    });

    transport.send({
      id: "test-logger",
      level: "INFO",
      time: 0,
      context: { foo: "bar" },
      message: "hello",
    });
    await transport.flush();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe(TEST_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    });
    expect(JSON.parse(init.body as string)).toEqual([
      { foo: "bar", message: "hello", level: "info", dt: new Date(0).toISOString() },
    ]);
  });

  it("buffers records until batchSize is reached", async () => {
    const fetch = createMockFetch();
    const transport = createBetterStackTransport({
      sourceToken: "test-token",
      endpoint: TEST_ENDPOINT,
      fetch,
      batchSize: 2,
    });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "one" });
    transport.send({ id: "test-logger", level: "INFO", time: 2, context: {}, message: "two" });
    await transport.flush();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(init.body as string)).toHaveLength(2);
  });

  it("flush sends any remaining buffered records", async () => {
    const fetch = createMockFetch();
    const transport = createBetterStackTransport({
      sourceToken: "test-token",
      endpoint: TEST_ENDPOINT,
      fetch,
      batchSize: 10,
    });

    transport.send({ id: "test-logger", level: "WARN", time: 1, context: {}, message: "hello" });
    await transport.flush();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("sends to the configured endpoint", async () => {
    const fetch = createMockFetch();
    const transport = createBetterStackTransport({
      sourceToken: "test-token",
      fetch,
      endpoint: "https://s9999.eu-nbg-2.betterstackdata.com",
    });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });
    await transport.flush();

    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://s9999.eu-nbg-2.betterstackdata.com");
  });

  it("uses a custom format function when provided", async () => {
    const fetch = createMockFetch();
    const transport = createBetterStackTransport({
      sourceToken: "test-token",
      endpoint: TEST_ENDPOINT,
      fetch,
      format: (record) => ({ msg: record.message }),
    });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });
    await transport.flush();

    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(init.body as string)).toEqual([{ msg: "hello" }]);
  });

  it("does not write records below the configured level", async () => {
    const fetch = createMockFetch();
    const transport = createBetterStackTransport({
      sourceToken: "test-token",
      endpoint: TEST_ENDPOINT,
      fetch,
      level: "WARN",
    });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "dropped" });
    await transport.flush();

    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws on flush when the Better Stack API responds with an error", async () => {
    const fetch = createMockFetch(false);
    const transport = createBetterStackTransport({
      sourceToken: "test-token",
      endpoint: TEST_ENDPOINT,
      fetch,
    });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });

    await expect(transport.flush()).rejects.toThrow(
      "Better Stack transport failed to send logs: 500 Error",
    );
  });
});
