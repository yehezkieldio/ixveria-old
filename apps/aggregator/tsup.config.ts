import "../../packages/environment/env";

import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/*.test.ts*"],
    clean: true,
    sourcemap: process.env.NODE_ENV !== "production",
    minify: true,
    skipNodeModulesBundle: true,
    keepNames: true,
    tsconfig: "tsconfig.json",
    noExternal: ["@ixveria/environment", "@ixveria/database", "@ixveria/stores", "@ixveria/utils"],
});
