import { test, expect } from '@playwright/test';

test.describe('Authenticated', () => {
  test('profile page loads', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 45_000 });
  });

  test('cart page loads', async ({ page }) => {
    await page.goto('/sepet');
    await expect(page.getByRole('heading', { name: 'Sepetim' })).toBeVisible({ timeout: 30_000 });
  });
});
