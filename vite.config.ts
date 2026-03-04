import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/ocr": {
        target: "https://o8v52nwv83.execute-api.us-east-1.amazonaws.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api\/ocr/, "/ocr"),
      },
      "/api/analysis": {
        target: "https://bc2q32foef.execute-api.us-east-1.amazonaws.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api\/analysis/, "/v1/chat/completions"),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
