import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = path.join(process.cwd(), 'playwright', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL?.trim();
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error('E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set for authenticated E2E.');
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto('/login');
  const noThanks = page.getByRole('button', { name: 'Hayır, İstemiyorum' });
  if (await noThanks.isVisible().catch(() => false)) {
    await noThanks.click();
  }
  await page.getByLabel('E-posta Adresi').fill(email);
  await page.getByLabel('Şifre').fill(password);
  await page.getByRole('button', { name: 'Giriş Yap' }).click();

  await expect(page).toHaveURL(/\/$/, { timeout: 60_000 });
  await expect(
    page.getByRole('banner').getByRole('link', { name: /Logo itemsatış/i })
  ).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
