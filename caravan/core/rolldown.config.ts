import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
      cleanDir: true,
      minify: {
        codegen: {
          legalComments: "none",
          removeWhitespace: true,
        },
        compress: true,
      },
    },
  },
]);
