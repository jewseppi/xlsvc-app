/**
 * E2E Test Helpers
 * Common utilities for Playwright E2E tests
 */

/**
 * Login helper - sets up authenticated session
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Login options
 * @param {string} options.email - User email (default: 'test@example.com')
 * @param {boolean} options.isAdmin - Whether user is admin (default: false)
 */
export async function login(page, options = {}) {
  const { email = 'test@example.com', isAdmin = false } = options;
  
  // Set token in localStorage
  await page.goto('/app');
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, 'mock-token');
  
  // Mock profile API
  await page.route('**/api/profile', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        email,
        is_admin: isAdmin
      })
    });
  });
  
  // Mock files API
  await page.route('**/api/files', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ files: [] })
    });
  });
  
  // Reload to trigger auth check
  await page.reload({ waitUntil: 'domcontentloaded' });
  
  // Wait for React to hydrate
  await page.waitForSelector('#root', { state: 'attached' });
  await page.waitForFunction(
    () => {
      const root = document.getElementById('root');
      return root && !root.textContent?.includes('Loading...');
    },
    { timeout: 10000 }
  );
  
  // Wait for dashboard to load
  await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

/**
 * Wait for React app to be ready
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function waitForAppReady(page) {
  await page.waitForSelector('#root', { state: 'attached' });
  await page.waitForFunction(
    () => {
      const root = document.getElementById('root');
      return root && !root.textContent?.includes('Loading...');
    },
    { timeout: 10000 }
  );
}

/**
 * Mock file upload API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} fileData - File data to return
 */
export async function mockFileUpload(page, fileData = {}) {
  const defaultFile = {
    file_id: 1,
    original_filename: 'test.xlsx',
    file_size: 1024
  };
  
  await page.route('**/api/upload', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...defaultFile, ...fileData })
    });
  });
}

/**
 * Mock generated files API
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} files - Generated files data
 */
export async function mockGeneratedFiles(page, files = {}) {
  const defaultFiles = {
    macros: [],
    instructions: [],
    reports: [],
    processed: []
  };
  
  await page.route('**/api/files/*/generated', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...defaultFiles, ...files })
    });
  });
}

/**
 * Mock processing history API
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Array} history - Processing history array
 */
export async function mockProcessingHistory(page, history = []) {
  await page.route('**/api/files/*/history', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ history })
    });
  });
}

/**
 * Clear all mocks and localStorage
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function clearAuthState(page) {
  await page.goto('/app');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.unroute('**/api/**');
}

/**
 * Wait for element with retry
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - CSS selector or text
 * @param {Object} options - Wait options
 */
export async function waitForElement(page, selector, options = {}) {
  const { timeout = 10000, state = 'visible' } = options;
  
  try {
    if (selector.startsWith('text=')) {
      await page.waitForSelector(selector, { timeout, state });
    } else {
      await page.locator(selector).waitFor({ timeout, state });
    }
  } catch (error) {
    // Element not found, return null
    return null;
  }
}
