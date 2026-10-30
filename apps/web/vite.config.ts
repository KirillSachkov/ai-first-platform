import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // The repository root .env serves host runs; Compose passes the same names as variables.
  const env = { ...loadEnv(mode, "../..", ""), ...process.env };
  return {
    plugins: [
      // File routes live in the FSD app layer and only mount pages; it must precede react().
      tanstackRouter({
        target: "react",
        routesDirectory: "./src/app/routes",
        generatedRouteTree: "./src/app/route-tree.gen.ts",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: { tsconfigPaths: true },
    server: {
      host: env["WEB_HOST"] ?? "127.0.0.1",
      port: 5173,
      strictPort: true,
      // The browser calls same-origin /api; the dev server forwards it to the backend without the
      // prefix, so no CORS, cookies stay first-party and no API URL is built into the bundle.
      proxy: {
        "/api": {
          target: env["API_PROXY_TARGET"] ?? "http://127.0.0.1:3000",
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
