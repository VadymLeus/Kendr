// frontend/src/services/api.js
import axios from 'axios';

// Створюємо екземпляр axios з попередньо налаштованою конфігурацією
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Базова URL-адреса для всіх запитів
});

// Додаємо перехоплювач (interceptor) запитів. Ця функція буде виконуватися
// ПЕРЕД кожним запитом, надісланим через apiClient.
apiClient.interceptors.request.use(
    (config) => {
        // Отримуємо токен з localStorage
        const token = localStorage.getItem('token');
        
        // Якщо токен існує, додаємо його до заголовка Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Повертаємо змінену конфігурацію, щоб запит міг продовжитись
        return config;
    },
    (error) => {
        // Якщо під час налаштування запиту виникла помилка, відхиляємо проміс
        return Promise.reject(error);
    }
);

export default apiClient;