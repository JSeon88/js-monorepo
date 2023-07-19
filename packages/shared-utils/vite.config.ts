import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), dts()],
  build: {
    lib: {
      entry: "./src/main.ts",
      name: "shared-utils",
      formats: ["es", "umd"],
      fileName: (format: string, fileName: string) =>
        `${fileName}.${format}.js`,
    },
    target: "esnext",
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
