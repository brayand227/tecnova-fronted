import axios from 'axios';

// ✅ Usar variable de entorno o localhost por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor para añadir token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor para manejar errores (opcional pero recomendado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Error en API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Puedes manejar errores globales aquí (ej: logout si 401)
    if (error.response?.status === 401) {
      console.warn('⚠️ Sesión expirada');
      localStorage.removeItem('token');
      // opcional: window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;