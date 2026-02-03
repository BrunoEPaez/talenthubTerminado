import axios from 'axios';

// 1. Obtenemos la URL del .env o usamos localhost por defecto
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 2. PARCHE DE SEGURIDAD PARA URLS
 * Si la URL del .env termina en /api, se lo quitamos.
 * Esto evita el error de rutas duplicadas como /api/api/login.
 */
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

// Interceptor para inyectar el token JWT en el header Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta (como el 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o token inválido");
    }
    return Promise.reject(error);
  }
);

// Force refresh: 2026-02-03_v1