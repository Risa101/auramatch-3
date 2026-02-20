// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config
export default defineConfig({
  plugins: [react()],
  base: "/", // ใช้ base path หากโฟลเดอร์โปรเจกต์ถูกย้าย
  server: {
    proxy: {
      "^/(api|admin|products|looks|promotions|brands|favorites|login|register|forgot-password|reset-password|delete_analysis)": {
        target: "http://127.0.0.1:5010",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src", // เพิ่ม alias เพื่อให้สามารถใช้ path แบบสะดวก
    },
  },
});
