import axios from 'axios';

/**
 * Obtenemos la URL del .env.
 * Si en el .env pusiste "https://.../api", el parche de abajo lo corregirá 
 * para que no se duplique al hacer las peticiones.
 */
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// PARCHE: Eliminamos el "/api" del final si existe.
// Esto evita que al llamar a api.post('/api/login') se genere ".../api/api/login"
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

// Interceptor para inyectar el token de seguridad en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Es vital el espacio después de 'Bearer'
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o token inválido");
      // Opcional: limpiar token si la sesión no es válida
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);