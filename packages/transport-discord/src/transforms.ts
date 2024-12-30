import { TLogLevel } from "@caravan-logger/logger/dist/level";

const ColorMap = {
  TRACE: 0x808080,
  DEBUG: 0x1100ff,
  INFO: 0x00ff65,
  WARN: 0xffa500,
  ERROR: 0xff4500,
  FATAL: 0xff0000,
} as const satisfies Record<TLogLevel, number>;

export { ColorMap };
