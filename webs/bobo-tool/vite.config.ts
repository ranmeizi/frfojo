import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic" })],
  // plugins: [react()],
  resolve: {
    // 数组顺序：更具体的 @/sub 必须写在 @ 前面，否则 @/sub/... 会被 @ → src 抢走
    alias: [
      {
        find: "@/sub",
        replacement: path.resolve(__dirname, "../../_submods"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 8012,
    cors: true,
  },
});
