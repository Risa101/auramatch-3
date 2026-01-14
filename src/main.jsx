import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.postcss";
import "./lib/i18n";

// ✅ AOS
import AOS from "aos";
import "aos/dist/aos.css";

// ✅ init AOS (ครั้งเดียว)
AOS.init({
  duration: 800,              // ความเร็ว animation
  easing: "ease-out-cubic",   // easing สวย ๆ
  once: true,                 // เล่นครั้งเดียวตอน scroll
  offset: 80,                 // ระยะก่อน trigger
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
