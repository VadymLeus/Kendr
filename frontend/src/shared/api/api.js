// frontend/src/shared/api/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'Щось пішло не так';
      if (status === 401) {
        console.error("Термін дії сесії вийшов або токен недійсний.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      else if (error.config && error.config.suppressToast) {
      }
      else if (status === 403) {
        toast.error(`Доступ заборонено: ${message}`);
      }
      else if (status === 404) {
        if (error.config.method !== 'get') {
             toast.error(`Ресурс не знайдено: ${message}`);
        }
      }
      else if (status >= 500) {
        toast.error(`Помилка сервера: ${message}`);
      }
      else {
         if (error.config.method !== 'get') {
            toast.error(`Помилка: ${message}`);
         }
      }
    } else if (error.request) {
      if (!error.config?.suppressToast) {
          toast.error('Сервер не відповідає. Перевірте підключення до інтернету.');
      }
    } else {
      if (!error.config?.suppressToast) {
          toast.error(`Помилка: ${error.message}`);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;