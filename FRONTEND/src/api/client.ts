import axios from 'axios';

// 1. Obtenemos la URL base del .env
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 2. CONFIGURACIÓN DE LA BASE URL
 * Forzamos a que la URL siempre termine en /api de forma limpia.
 * Así, cuando hagas api.get('/jobs'), Axios pedirá automáticamente /api/jobs.
 */
const API_BASE_URL = rawBaseUrl.endsWith('/api') 
  ? rawBaseUrl 
  : `${rawBaseUrl.replace(/\/$/, '')}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar el token JWT
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

// Force refresh v2: Forzando prefijo /api