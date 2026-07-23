import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Single-file build => dist/index.html is fully self-contained and opens
// by double-click (works offline, perfect as a gift).
export default defineConfig({
  base: "./",
  assetsInclude: ["**/*.glb"],
  plugins: [react(), viteSingleFile()],
  build: {
    target: "es2019",
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
  },
});
