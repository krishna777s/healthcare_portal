import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, "");

export const api = axios.create({
  baseURL: API_BASE,
});

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    config.params = { ...config.params, token };
  }
  return config;
});

// Build a full URL for uploaded files
export function getFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE}${path}`;
}

export default api;
