import { Logger } from "../logger";
import { ConsoleTransport } from "../transport";

describe("Logger", () => {
  it("should log at different levels", () => {
    const a = new Logger({
      level: "info",
      transports: [
        new ConsoleTransport({ options: { pretty: true } }),
        new ConsoleTransport({ level: "error" }),
      ],
    });

    a.info("test info message");
    a.debug("test debug message");
    a.error("test error message");
  });
});
