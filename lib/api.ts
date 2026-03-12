import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const BASE_URL = API_URL.replace("/api/v1", "");

export const getImageUrl = (path: string | undefined) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if 401 Unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Only redirect if we are not already on the login page to avoid loops
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
