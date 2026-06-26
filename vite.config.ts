import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), reactRouter()],
  build: {
    rollupOptions: {
      output: {
        // Split rarely-changing vendor code into stable chunks for better caching.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/[\\/](react|react-dom|react-router)[\\/]/.test(id)) {
              return "react-vendor";
            }
            if (/[\\/](@reduxjs|react-redux|@tanstack)[\\/]/.test(id)) {
              return "data-vendor";
            }
          }
        },
      },
    },
  },
  server: {
    watch: {
      // json-server writes db.json on every API mutation; ignore it so Vite does not full-reload
      ignored: [path.resolve(projectRoot, "db.json"), "**/db.json"],
    },
  },
});
