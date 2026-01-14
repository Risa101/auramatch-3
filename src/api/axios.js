import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
