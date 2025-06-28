import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv, type UserConfig } from "vite";

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "https://api.replicate.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/v1"),
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.error("Proxy error:", err);
            });
          },
        },
      },
    },
    test: {
      // 👋 add the line below to add jsdom to vite
      setupFiles: path.resolve(__dirname, "setup-test.ts"),
      environment: "jsdom",
    },
  } as UserConfig);
};
