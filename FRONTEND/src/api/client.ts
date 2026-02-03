import axios from 'axios';

// 1. Obtenemos la URL
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 2. Aplicamos el parche para evitar el /api/api
const API_BASE_URL = rawBaseUrl.endsWith('/api') 
  ? rawBaseUrl.replace(/\/api$/, '') 
  : rawBaseUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor para el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o token inválido");
    }
    return Promise.reject(error);
  }
);