// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// URL ของ backend บน Render -- ฝังตอน build production โดยตรง เพราะเข้าไปแก้
// Environment Variables ในโปรเจกต์ Vercel ไม่ได้ (ค่าเดิมที่นั่นยังชี้ไป Railway
// ซึ่งปิดแล้ว) ค่านี้จึงทับ VITE_API_BASE_URL / VITE_API_URL จาก Vercel
const PRODUCTION_API_URL = "https://auramatch-backend-sb6o.onrender.com";

// Vite config
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define:
    mode === "production"
      ? {
          "import.meta.env.VITE_API_BASE_URL": JSON.stringify(PRODUCTION_API_URL),
          "import.meta.env.VITE_API_URL": JSON.stringify(PRODUCTION_API_URL),
        }
      : {},
  base: "/", // ใช้ base path หากโฟลเดอร์โปรเจกต์ถูกย้าย
  server: {
    proxy: {
      "^/(api|admin|products|looks|promotions|brands|favorites|login|register|forgot-password|reset-password|delete_analysis|makeup|hair|faceshape|overlays|eye|product|avatars|uploads|static|stock)": {
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
}));
