import { test, expect } from '@playwright/test';

test('Повний флоу: Створення сайту, перевірка Cookie та видалення', async ({ page }) => {
  // 1. Авторизація
  await page.goto('/login'); 
  await page.locator('input[name="loginInput"]').fill('e2e_test@kendr.com');
  await page.locator('input[name="password"]').fill('123456'); 
  await page.locator('button[type="submit"]').click();
  await page.waitForNavigation();

  // 2. Створення нового сайту
  await page.goto('/create-site');
  const uniqueSlug = 'test-site-' + Date.now();
  await page.getByPlaceholder('Мій Сайт').fill('Мій E2E Сайт');
  await page.getByPlaceholder('my-cool-shop').fill(uniqueSlug);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /створити сайт/i }).click();

  // 3. Чекаємо дашборд створеного сайту
  await page.waitForURL(`**/dashboard/${uniqueSlug}`);
  await page.waitForTimeout(500);

  // 4. Переходимо в Налаштування
  await page.locator('header').getByRole('button', { name: 'Налаштування' }).click();

  // 5. Увімкнення Cookie
  const cookieSection = page.locator('div').filter({ hasText: 'Запитувати згоду відвідувачів на використання файлів cookie' });
  await cookieSection.locator('.switch-wrapper').first().click();
  await page.waitForTimeout(2000);

  // 6. Перевірка банера на публічній сторінці сайту
  await page.goto(`/site/${uniqueSlug}`);
  const bannerText = page.getByText('Цей сайт використовує файли cookie для покращення користувацького досвіду.');
  await expect(bannerText).toBeVisible();
  const acceptButton = page.getByRole('button', { name: 'Зрозуміло' });
  await expect(acceptButton).toBeVisible();
  await acceptButton.click();
  await expect(bannerText).toBeHidden();

  // 7. Повернення в дашборд через HeaderBlock
  await page.locator('a[title="Налаштування сайту"]').click();
  await page.waitForURL(`**/dashboard/${uniqueSlug}`);
  await page.waitForTimeout(500);
  await page.locator('header').getByRole('button', { name: 'Налаштування' }).click();

  // 8. Видалення сайту
  await page.getByRole('button', { name: 'Видалити сайт', exact: true }).first().click();
  await page.getByPlaceholder('Введіть DELETE').fill('DELETE');
  const deletePromise = page.waitForResponse(response => 
    response.url().includes(`/sites/`) && response.request().method() === 'DELETE'
  );
  
  await page.locator('.z-9999').getByRole('button', { name: 'Видалити сайт', exact: true }).click();
  await deletePromise;
  await page.waitForURL('**/my-sites');
  await expect(page).toHaveURL(/.*\/my-sites/);
  await page.waitForTimeout(4000);
  await expect(page).toHaveURL(/.*\/my-sites/);
});