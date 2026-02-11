// frontend/src/shared/api/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const safeB64Decode = (str) => {
    try {
        return decodeURIComponent(escape(atob(str)));
    } catch (e) {
        return '';
    }
};

apiClient.interceptors.response.use(
  (response) => {
    const isLockedHeader = response.headers['x-editor-locked'];
    if (isLockedHeader === 'true') {
        window.dispatchEvent(new CustomEvent('editor_locked_status', { detail: true }));
    } else if (isLockedHeader === 'false') {
        window.dispatchEvent(new CustomEvent('editor_locked_status', { detail: false }));
    }
    const announcementHeader = response.headers['x-global-announcement'];
    if (announcementHeader !== undefined) {
        const message = announcementHeader ? safeB64Decode(announcementHeader) : null;
        window.dispatchEvent(new CustomEvent('global_announcement_update', { detail: message }));
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data, headers } = error.response;
      const announcementHeader = headers['x-global-announcement'];
      if (announcementHeader !== undefined) {
          const message = announcementHeader ? safeB64Decode(announcementHeader) : null;
          window.dispatchEvent(new CustomEvent('global_announcement_update', { detail: message }));
      }

      if (status === 503) {
        if (data.editor_locked) {
            window.dispatchEvent(new CustomEvent('editor_locked_status', { detail: true }));
            toast.warning(`Режим читання: ${data.message}`, { autoClose: 5000 });
            return Promise.reject(error);
        }
        if (data.maintenance_mode) {
           window.dispatchEvent(new CustomEvent('maintenance_mode_active', { detail: { message: data.message } }));
           return Promise.reject(error); 
        }
      }
      if (!error.config?.suppressToast && status !== 503 && status !== 401) {
         toast.error(data.message || 'Помилка');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;