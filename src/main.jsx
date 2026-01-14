import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.postcss"; // ✅ ถูกแล้ว ถ้าไฟล์อยู่ src/index.postcss
import "./lib/i18n";

import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
  duration: 800,
  easing: "ease-out-cubic",
  once: true,
  offset: 80,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
