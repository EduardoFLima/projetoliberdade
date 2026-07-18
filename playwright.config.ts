import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const port = isCI ? 4173 : 5173

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: isCI ? 'pnpm preview' : 'pnpm dev',
    url: `http://localhost:${port}`,
    reuseExistingServer: !isCI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
