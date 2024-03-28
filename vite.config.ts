import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
    visualizer({ emitFile: true, template: "flamegraph" }),
  ],
})
