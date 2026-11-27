import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const setting = (value, fallback) => (value || "").trim().replace(/\/+$/, "") || fallback;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = setting(env.API_PROXY_TARGET, "http://127.0.0.1:8001");

  return {
    plugins: [react()],
    server: {
      host: env.VITE_DEV_HOST || "127.0.0.1",
      port: Number(env.VITE_DEV_PORT || 5173),
      proxy: { "/api": proxyTarget },
    },
    preview: {
      host: env.VITE_DEV_HOST || "127.0.0.1",
      port: Number(env.VITE_DEV_PORT || 5173),
    },
  };
});
