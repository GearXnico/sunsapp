import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { contentSecurityPolicy } from "./src/lib/csp";

// GitHub Pages can't send headers, so the policy goes in a meta tag. Only in the build: the dev
// server injects inline scripts and styles for hot reload.
function cspMetaTag(apiUrl: string): Plugin {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: () => [
      {
        tag: "meta",
        attrs: { "http-equiv": "Content-Security-Policy", content: contentSecurityPolicy(apiUrl) },
        injectTo: "head-prepend",
      },
    ],
  };
}

export default defineConfig(({ mode }) => {
  const apiUrl = loadEnv(mode, ".", "VITE_").VITE_API_URL ?? "http://localhost:3000";

  return {
    plugins: [react(), cspMetaTag(apiUrl)],
    server: { port: 3001, strictPort: true },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/main.tsx", "src/vite-env.d.ts", "src/test/**", "src/**/*.test.{ts,tsx}"],
        thresholds: { lines: 80 },
      },
    },
  };
});
