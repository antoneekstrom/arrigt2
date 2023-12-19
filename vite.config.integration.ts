import { defineConfig } from "vitest/config";

/**
 * This configuration is used to run integration tests.
 * Disables parallel execution of tests, and uses a setup file to reset the database in between tests.
 */
export default defineConfig({
  test: {
    include: ["test/integration/**/*.test.ts"],
    setupFiles: ["test/integration/setup.ts"],
    threads: false,
    reporters: process.env.CI ? ["json", "html"] : [],
    outputFile: {
      json: "reports/integration/integration.json",
      html: "reports/integration/index.html",
    },
  },
});
