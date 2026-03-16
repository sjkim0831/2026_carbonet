import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const buildTarget = process.env.VITE_BUILD_TARGET === "classes"
  ? "../target/classes/static/react-migration"
  : "../src/main/resources/static/react-migration";

export default defineConfig({
  base: "/react-migration/",
  plugins: [react()],
  build: {
    outDir: buildTarget,
    emptyOutDir: true,
    manifest: true
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:18000",
        changeOrigin: true
      }
    }
  }
});
