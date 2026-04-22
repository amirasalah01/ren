import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function clearAuthAndRedirect() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_data");
  window.location.href = "/login";
}

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        if (!refreshPromise) {
          refreshPromise = axios
            .post("http://127.0.0.1:8000/api/auth/token/refresh/", {
              refresh: refreshToken,
            })
            .then((res) => {
              localStorage.setItem("access_token", res.data.access);
              return res.data.access;
            })
            .catch(() => {
              clearAuthAndRedirect();
              return null;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const newAccess = await refreshPromise;
        if (newAccess) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } else {
        clearAuthAndRedirect();
      }
    }
    return Promise.reject(error);
  }
);

export default api;