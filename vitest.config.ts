import { config } from "dotenv"
import { defineConfig } from "vitest/config"

config()

export default defineConfig({
  test: {
    coverage: {
      all: false,
      provider: "v8",
      reporter: process.env.CI
        ? ["json-summary", "json"]
        : ["text", "json", "html"],
      exclude: [
        "**/errors/utils.ts",
        "**/_cjs/**",
        "**/_esm/**",
        "**/_types/**",
        "**/*.test.ts",
        "**/test/**"
      ],
      include: ["./src/**/*.test.ts", "./src/**/*.test.ts"],
      thresholds: {
        lines: 80,
        functions: 50,
        branches: 60,
        statements: 80
      }
    },
    sequence: {
      shuffle: false,
      concurrent: false
    },
    include: ["./src/**/*.test.ts", "./src/**/*.test.ts"],
    environment: "node",
    testTimeout: 60_000,
    hookTimeout: 60_000
  }
})
