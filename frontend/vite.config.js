import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function apiConnectOrigins(...urls) {
  const origins = new Set();
  for (const url of urls) {
    try {
      const parsed = new URL(url);
      if (["http:", "https:"].includes(parsed.protocol)) origins.add(parsed.origin);
    } catch {
      // Relative "/api" — same-origin requests only.
    }
  }
  return [...origins].join(" ");
}

function buildHeaders(connectOrigins) {
  const connectSrc = `connect-src 'self'${connectOrigins ? ` ${connectOrigins}` : ""}`;
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy":
      "microphone=(self), camera=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      "media-src 'blob:'",
      connectSrc,
    ].join("; "),
  };
}

function headersFilePlugin(connectOrigins) {
  return {
    name: "halal-gta-security-headers",
    apply: "build",
    closeBundle() {
      const file = path.resolve(process.cwd(), "dist", "_headers");
      if (!fs.existsSync(file)) return;
      const content = fs
        .readFileSync(file, "utf8")
        .replace("__API_CONNECT_SRC__", connectOrigins);
      fs.writeFileSync(file, content);
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load all env vars in Node so non-VITE_ values (dev proxy target) stay
  // server-side and are never bundled into the browser build.
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = (env.API_PROXY_TARGET || "").trim().replace(/\/$/, "");
  const apiUrl = (env.VITE_API_URL || "").trim();
  const tajweedUrl = (env.VITE_TAJWEED_API_URL || "").trim();

  if (!proxyTarget || !apiUrl || !tajweedUrl) {
    throw new Error(
      "Set API_PROXY_TARGET, VITE_API_URL and VITE_TAJWEED_API_URL in frontend/.env",
    );
  }

  const connectOrigins = apiConnectOrigins(apiUrl, tajweedUrl);

  return {
    plugins: [react(), headersFilePlugin(connectOrigins)],
    server: {
      host: env.VITE_DEV_HOST || "127.0.0.1",
      port: Number(env.VITE_DEV_PORT || 5173),
      proxy: {
        "/api": proxyTarget,
      },
    },
    preview: {
      host: env.VITE_DEV_HOST || "127.0.0.1",
      port: Number(env.VITE_DEV_PORT || 5173),
      headers: buildHeaders(connectOrigins),
    },
  };
});
