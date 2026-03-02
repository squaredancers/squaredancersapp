import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
