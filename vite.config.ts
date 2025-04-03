import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cpSync } from "fs";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "copy-staticwebapp-config",
      writeBundle() {
        cpSync(
          path.resolve(__dirname, "staticwebapp.config.json"),
          path.resolve(__dirname, "dist/staticwebapp.config.json")
        );
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});