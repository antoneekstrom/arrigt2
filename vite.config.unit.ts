import { defineConfig } from "vitest/config";

/**
 * This configuration is used to run unit tests.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "app/**/*.test.ts"],
    reporters: ["json", "default"],
    outputFile: {
      json: "reports/unit/unit.json",
      // html: "reports/unit/index.html",
    },
    passWithNoTests: false,
    coverage: {
      reporter: ["json", "json-summary"],
      reportOnFailure: true,
      reportsDirectory: "reports/unit/coverage",
    },
  },
});
