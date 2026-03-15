import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/react-migration/",
  plugins: [react()],
  build: {
    outDir: "../src/main/resources/static/react-migration",
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
