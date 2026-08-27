import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
      cleanDir: true,
    },
    external: ["@caravan-logger/logger", "better-sqlite3"],
  },
]);
