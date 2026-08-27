import { afterEach, describe, expect, it, vi } from "vitest";

import { createDatadogTransport } from "../src/index";

const createMockFetch = (ok = true) => {
  const fetch = vi.fn(async () => ({
    ok,
    status: ok ? 202 : 500,
    statusText: ok ? "Accepted" : "Error",
  }));
  return fetch as unknown as typeof globalThis.fetch;
};

describe("createDatadogTransport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends each record immediately by default", async () => {
    const fetch = createMockFetch();
    const transport = createDatadogTransport({ apiKey: "test-key", fetch });

    transport.send({
      id: "test-logger",
      level: "INFO",
      time: 1,
      context: { foo: "bar" },
      message: "hello",
    });
    await transport.flush();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://http-intake.logs.datadoghq.com/api/v2/logs");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      "DD-API-KEY": "test-key",
    });
    expect(JSON.parse(init.body as string)).toEqual([
      { foo: "bar", message: "hello", status: "info", timestamp: 1, ddsource: "caravan-logger" },
    ]);
  });

  it("buffers records until batchSize is reached", async () => {
    const fetch = createMockFetch();
    const transport = createDatadogTransport({ apiKey: "test-key", fetch, batchSize: 2 });

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
    const transport = createDatadogTransport({ apiKey: "test-key", fetch, batchSize: 10 });

    transport.send({ id: "test-logger", level: "WARN", time: 1, context: {}, message: "hello" });
    await transport.flush();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("respects site and url overrides", async () => {
    const fetch = createMockFetch();
    const transport = createDatadogTransport({ apiKey: "test-key", fetch, site: "datadoghq.eu" });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });
    await transport.flush();

    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://http-intake.logs.datadoghq.eu/api/v2/logs");
  });

  it("applies service, hostname and tags to log entries", async () => {
    const fetch = createMockFetch();
    const transport = createDatadogTransport({
      apiKey: "test-key",
      fetch,
      service: "my-service",
      hostname: "my-host",
      tags: { env: "prod" },
    });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });
    await transport.flush();

    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(init.body as string)[0]).toMatchObject({
      service: "my-service",
      hostname: "my-host",
      ddtags: "env:prod",
    });
  });

  it("uses a custom format function when provided", async () => {
    const fetch = createMockFetch();
    const transport = createDatadogTransport({
      apiKey: "test-key",
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
    const transport = createDatadogTransport({ apiKey: "test-key", fetch, level: "WARN" });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "dropped" });
    await transport.flush();

    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws on flush when the Datadog API responds with an error", async () => {
    const fetch = createMockFetch(false);
    const transport = createDatadogTransport({ apiKey: "test-key", fetch });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });

    await expect(transport.flush()).rejects.toThrow(
      "Datadog transport failed to send logs: 500 Error",
    );
  });
});
