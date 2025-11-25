import axios from 'axios';

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const AuthInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🔒 Automatically attach token to every request
AuthInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { AxiosInstance, AuthInstance };
