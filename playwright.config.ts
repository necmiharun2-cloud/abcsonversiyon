import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const authFile = path.join(process.cwd(), 'playwright', '.auth', 'user.json');
const hasE2EAuth = Boolean(
  process.env.E2E_TEST_EMAIL?.trim() && process.env.E2E_TEST_PASSWORD
);

const projects: NonNullable<Parameters<typeof defineConfig>[0]['projects']> = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    testMatch: 'public.spec.ts',
  },
];

if (hasE2EAuth) {
  projects.push(
    {
      name: 'setup',
      testMatch: 'auth.setup.ts',
    },
    {
      name: 'chromium-authenticated',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      testMatch: 'authenticated.spec.ts',
    }
  );
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'list' : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects,
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
