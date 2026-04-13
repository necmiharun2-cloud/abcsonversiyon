import { test, expect, type Page } from '@playwright/test';

async function dismissNotificationModalIfPresent(page: Page) {
  const noThanks = page.getByRole('button', { name: 'Hayır, İstemiyorum' });
  if (await noThanks.isVisible().catch(() => false)) {
    await noThanks.click();
  }
}

test.describe('Public routes', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('banner').getByRole('link', { name: /itemTR/i })
    ).toBeVisible();
  });

  test('static pages load', async ({ page }) => {
    await page.goto('/hakkimizda');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/sss');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('unknown path shows 404', async ({ page }) => {
    await page.goto('/yok-boyle-sayfa');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText('Aradığınız sayfa bulunamadı')).toBeVisible();
  });

  test('login page shows form', async ({ page }) => {
    await page.goto('/login');
    await dismissNotificationModalIfPresent(page);
    await expect(page.getByRole('heading', { name: 'Giriş Yap' })).toBeVisible();
    await expect(page.getByLabel('E-posta Adresi')).toBeVisible();
    await expect(page.getByLabel('Şifre')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Giriş Yap' })).toBeVisible();
  });
});
