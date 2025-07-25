import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8010,
    proxy: {
      // 将请求以 /tool_fetch_post 开头的内容代理到目标服务器
      "/clash": {
        target: "http://127.0.0.1:9090", // 替换为实际的目标服务器地址
        changeOrigin: true, // 修改 HTTP 请求头中的 `Origin`
        rewrite: (path) => path.replace(/^\/clash/, ""), // 重写路径
      },
    },
  },
});
