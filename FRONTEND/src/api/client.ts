import axios from 'axios';

// URL de producción en Render
const API_BASE_URL = 'https://talenthubterminado.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

/**
 * INTERCEPTOR DE PETICIÓN: 
 * Antes de que cada mensaje salga de React, este código pega el token.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Importante: El espacio después de 'Bearer ' es obligatorio
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPUESTA:
 * Si el servidor responde un 401 (No autorizado), limpia el token
 * y puede redirigir al usuario al login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o token inválido");
      // Opcional: limpiar localStorage si el token ya no sirve
      // localStorage.clear();
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// Etiqueta de versión para obligar refresco: v3_final_deploy_fix
export default api;