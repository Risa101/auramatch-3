import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error("API ERROR:", err.response || err);
    return Promise.reject(err);
  }
);

export default api;
