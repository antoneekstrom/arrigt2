import { defineConfig } from "vitest/config";

/**
 * This configuration is used to run integration tests.
 * Disables parallel execution of tests, and uses a setup file to reset the database in between tests.
 */
export default defineConfig({
  test: {
    include: ["test/integration/**/*.test.ts"],
    setupFiles: ["test/integration/setup.ts"],
    // threads: false,
    reporters: ["json", "default"],
    outputFile: {
      json: "reports/integration/integration.json",
      // html: "reports/integration/index.html",
    },
    coverage: {
      reporter: ["json", "json-summary"],
      reportOnFailure: true,
      reportsDirectory: "reports/integration/coverage",
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
