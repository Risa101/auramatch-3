import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5010",
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
