import axios from 'axios';

// FORZAMOS LA URL DIRECTAMENTE AQUÍ
const API_BASE_URL = 'https://yucky-rina-emmanuelnovo-3439a4c7.koyeb.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// CAMBIO PARA OBLIGAR A CLOUDFLARE A ACTUALIZAR: v3_final_test