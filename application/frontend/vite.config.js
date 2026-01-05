import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const proxyTarget =
    process.env.VITE_DEV_PROXY_TARGET || "http://localhost:3001";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      allowedHosts: ["frontend", "quiz-app.localhost"],
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/socket.io": {
          target: proxyTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 80,
      host: true,
    },
  };
});
