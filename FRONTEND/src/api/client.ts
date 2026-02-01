// src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Accept': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Fíjate que diga 'Bearer ' con el espacio
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});