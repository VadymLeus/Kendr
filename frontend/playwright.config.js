import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',// Вказуємо, де лежать наші E2E тести
  use: {
    headless: false, // Одразу кажемо роботу завжди показувати браузер (щоб не писати --headed)
    baseURL: 'http://localhost:5173', // Базова адреса твого сайту
  },
});