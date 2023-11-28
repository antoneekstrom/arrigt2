// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    reporters: ["html", "clear-text", "progress"],
    testRunner: "vitest",
    coverageAnalysis: "perTest",
    ignoreStatic: true,
    checkers: ["typescript"],
    typescriptChecker: {
        prioritizePerformanceOverAccuracy: true
    }
};
export default config;
