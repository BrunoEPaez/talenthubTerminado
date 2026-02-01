// src/api/client.ts
import axios from 'axios';

// Usamos import.meta.env para Vite. 
// Si no existe la variable, por defecto usará localhost para que sigas trabajando tranquilo.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json'
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

// Opcional: Interceptor para manejar errores globales (como sesiones expiradas)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o token inválido");
      // Aquí podrías limpiar el localStorage y redirigir al login si quisieras
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);