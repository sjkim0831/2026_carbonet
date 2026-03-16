import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const buildTarget = process.env.VITE_BUILD_TARGET === "classes"
  ? "../target/classes/static/react-migration"
  : "../src/main/resources/static/react-migration";

export default defineConfig({
  base: "/react-migration/",
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      react: fileURLToPath(new URL("./node_modules/react", import.meta.url)),
      "react-dom": fileURLToPath(new URL("./node_modules/react-dom", import.meta.url))
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"]
  },
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
