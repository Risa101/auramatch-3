// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config
export default defineConfig({
  plugins: [react()],
  base: "/AURAMATCH-VER2/", // ใช้ base path หากโฟลเดอร์โปรเจกต์ถูกย้าย
  resolve: {
    alias: {
      "@": "/src", // เพิ่ม alias เพื่อให้สามารถใช้ path แบบสะดวก
    },
  },
});
