import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// --host and --port come from the command line (the repo-mode recipe passes
// them); allowedHosts lets the app answer on any hostname, including the
// per-visitor preview hosts and <name>.localhost.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { allowedHosts: true },
  preview: { allowedHosts: true },
});
