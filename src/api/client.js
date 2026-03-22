import axios from "axios";

function resolveApiBaseUrl() {
  const isLocalhostHost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isLocalhostHost) return "";

  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
  return String(raw).replace(/\/+$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

if (
  typeof window !== "undefined" &&
  !["localhost", "127.0.0.1"].includes(window.location.hostname) &&
  !API_BASE_URL
) {
  console.error("Missing VITE_API_BASE_URL/VITE_API_URL for production.");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auramatch:token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("auramatch:token");
      localStorage.removeItem("auramatch:isLoggedIn");
      localStorage.removeItem("auramatch:user");
      localStorage.removeItem("auramatch:isAdmin");
      window.dispatchEvent(new Event("auth:changed"));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
