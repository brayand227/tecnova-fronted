import axios from 'axios';

// ✅ Configuración dinámica: desarrollo local vs producción
const isProduction = import.meta.env.PROD;
const API_URL = isProduction 
  ? 'https://tecnova-backend.onrender.com/api'  // 👈 CAMBIA A RENDER
  : 'http://localhost:8080/api';  // Desarrollo local

console.log(`🌐 API URL: ${API_URL} (${isProduction ? 'producción' : 'desarrollo'})`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ✅ Interceptor para añadir token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 30)}...` : null
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`);
    return response;
  },
  (error) => {
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    };
    
    console.error('❌ Error en API:', errorInfo);
    
    // Manejar sesión expirada
    if (error.response?.status === 401) {
      console.warn('⚠️ Sesión expirada o no autorizada');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;