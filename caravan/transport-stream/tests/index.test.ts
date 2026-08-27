import Stream from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createStreamTransport } from "../src/index";

const createMockStream = () => {
  const stream = new Stream.Writable({
    write: (_chunk, _encoding, callback) => callback(),
  });
  const write = vi.spyOn(stream, "write");
  return { stream, write };
};

describe("createStreamTransport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes log records as JSON by default", async () => {
    const { stream, write } = createMockStream();
    const transport = createStreamTransport({ stream });

    transport.send({
      id: "test-logger",
      level: "INFO",
      time: 1,
      context: { foo: "bar" },
      message: "hello",
    });
    await transport.flush();

    expect(write).toHaveBeenCalledTimes(1);
    expect(JSON.parse((write.mock.calls[0][0] as string).trim())).toEqual({
      id: "test-logger",
      level: "INFO",
      time: 1,
      context: { foo: "bar" },
      message: "hello",
    });
  });

  it("appends a line feed by default", async () => {
    const { stream, write } = createMockStream();
    const transport = createStreamTransport({ stream });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });
    await transport.flush();

    expect(write.mock.calls[0][0]).toMatch(/\n$/);
  });

  it("appends a carriage return and line feed when eol is 'crlf'", async () => {
    const { stream, write } = createMockStream();
    const transport = createStreamTransport({ stream, eol: "crlf" });

    transport.send({ id: "test-logger", level: "INFO", time: 1, context: {}, message: "hello" });
    await transport.flush();

    expect(write.mock.calls[0][0]).toMatch(/\r\n$/);
  });

  it("does not write records below the configured level", async () => {
    const { stream, write } = createMockStream();
    const transport = createStreamTransport({ stream, level: "WARN" });

    transport.send({
      id: "test-logger",
      level: "INFO",
      time: 1,
      context: {},
      message: "should be dropped",
    });
    await transport.flush();

    expect(write).not.toHaveBeenCalled();
  });
});
