import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const buildTarget = process.env.VITE_BUILD_TARGET === "classes"
  ? "../target/classes/static/react-app"
  : "../src/main/resources/static/react-app";
const mirrorTarget = process.env.VITE_BUILD_TARGET === "classes"
  ? "../src/main/resources/static/react-app"
  : "../target/classes/static/react-app";

function syncBuildOutputPlugin() {
  return {
    name: "sync-build-output",
    async closeBundle() {
      const sourceDir = path.resolve(__dirname, buildTarget);
      const targetDir = path.resolve(__dirname, mirrorTarget);

      await rm(targetDir, { recursive: true, force: true });
      await mkdir(path.dirname(targetDir), { recursive: true });
      await cp(sourceDir, targetDir, { recursive: true });
    }
  };
}

export default defineConfig({
  base: "/assets/react/",
  plugins: [react(), syncBuildOutputPlugin()],
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
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("react/jsx-runtime")) {
            return "vendor-react";
          }
          if (id.includes("/src/features/screen-builder/catalog/buttonCatalogCore")) {
            return "screenBuilderCatalogSource";
          }
          if (id.includes("/src/features/screen-builder/catalog/screenBuilderCatalogPreview")) {
            return "screenBuilderCatalogPreview";
          }
          if (id.includes("/src/features/screen-builder/panels/ScreenBuilderEditorPanels")
            || id.includes("/src/features/screen-builder/hooks/useScreenBuilderEditor")
            || id.includes("/src/features/screen-builder/shared/screenBuilderPreview")) {
            return "screenBuilderEditor";
          }
          if (id.includes("/src/features/screen-builder/panels/ScreenBuilderGovernancePanels")
            || id.includes("/src/features/screen-builder/hooks/useScreenBuilderGovernanceState")
            || id.includes("/src/features/screen-builder/catalog/buttonCatalogCore")) {
            return "screenBuilderGovernance";
          }
          if (id.includes("/src/features/screen-builder/panels/ScreenBuilderOverviewPanels")
            || id.includes("/src/features/screen-builder/hooks/useScreenBuilderWorkspaceState")
            || id.includes("/src/features/screen-builder/hooks/useScreenBuilderMutations")
            || id.includes("/src/features/screen-builder/shared/screenBuilderShared")
            || id.includes("/src/features/screen-builder/shared/screenBuilderUtils")) {
            return "screenBuilderWorkspace";
          }
          if (id.includes("/src/lib/api/screenBuilder") || id.includes("/src/lib/api/screenGovernance")) {
            return "screenBuilderApi";
          }
          if (id.includes("/src/features/platform-studio/")) {
            return "platformStudio";
          }
          if (id.includes("/src/features/environment-management/")) {
            return "environmentManagement";
          }
        }
      }
    }
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
