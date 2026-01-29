import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    [
      'monocart-reporter',
      {
        name: 'E2E Test Report',
        outputFile: './playwright-report/index.html',
        coverage: {
          entryFilter: (entry) => !entry.url.includes('node_modules'),
          sourceFilter: (sourcePath) => sourcePath.includes('/src/') && !sourcePath.includes('node_modules'),
          reports: ['v8', 'console-summary'],
          onEnd: (coverageResults) => {
            const thresholds = { lines: 100, functions: 100, branches: 100, statements: 100 };
            const errors = [];
            const { summary } = coverageResults;
            if (summary) {
              Object.keys(thresholds).forEach((k) => {
                const pct = summary[k]?.pct ?? 0;
                if (pct < thresholds[k]) {
                  errors.push(`E2E coverage threshold for ${k} (${pct}%) not met: ${thresholds[k]}%`);
                }
              });
            }
            if (errors.length) {
              const errMsg = errors.join('\n');
              console.error(errMsg);
              throw new Error(errMsg);
            }
          },
        },
      },
    ],
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      VITE_E2E_TEST: 'true',
      NODE_ENV: 'development',
    },
  },
});
