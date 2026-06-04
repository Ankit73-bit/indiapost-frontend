import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // In dev, proxy /api calls to the remote backend — avoids CORS entirely
      "/api": {
        target: "https://bnplindiapost.parassolutions.tech",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
