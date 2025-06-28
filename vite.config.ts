import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

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
          headers: {
            Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
          },
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.error("Proxy error:", err);
            });
          },
        },
      },
    },
  });
};
