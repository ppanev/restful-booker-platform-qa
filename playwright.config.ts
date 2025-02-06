import { defineConfig } from 'playwright/test';

require('dotenv').config('.env');

const workspacePath = process.env.WORKSPACE_PATH;

export default defineConfig({
  webServer: {
    command: `cd ${workspacePath} && ./run_locally.sh`,
    port: 3006,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: process.env.BASE_URL,
    headless: false,
    screenshot: 'only-on-failure',
  },
  testDir: './tests',
  reporter: [['html', { open: 'never' }]],
});
