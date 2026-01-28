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

/**
 * Upload a file using the file input
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} fileOptions - File options
 * @param {string} fileOptions.name - File name
 * @param {string} fileOptions.mimeType - MIME type
 * @param {Buffer} fileOptions.buffer - File buffer content
 * @returns {Promise<void>}
 */
export async function uploadFile(page, fileOptions = {}) {
  const {
    name = 'test.xlsx',
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer = Buffer.from('test content')
  } = fileOptions;
  
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name,
    mimeType,
    buffer
  });
  
  // Wait a bit for upload to process
  await page.waitForTimeout(1000);
}

/**
 * Mock files API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Array} files - Array of file objects
 */
export async function mockFilesList(page, files = []) {
  await page.route('**/api/files', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ files })
    });
  });
}

/**
 * Mock profile API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} user - User object
 */
export async function mockProfile(page, user = {}) {
  const defaultUser = {
    id: 1,
    email: 'test@example.com',
    is_admin: false
  };
  
  await page.route('**/api/profile', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...defaultUser, ...user })
    });
  });
}

/**
 * Mock login API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} token - Access token to return
 */
export async function mockLogin(page, token = 'valid-token') {
  await page.route('**/api/login', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: token })
    });
  });
}

/**
 * Mock registration API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} token - Access token to return
 */
export async function mockRegister(page, token = 'new-user-token') {
  await page.route('**/api/register', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: token })
    });
  });
}

/**
 * Mock invitation validation API
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Validation options
 * @param {boolean} options.valid - Whether invitation is valid
 * @param {string} options.email - Email associated with invitation
 */
export async function mockInvitationValidation(page, options = {}) {
  const { valid = true, email = 'newuser@example.com' } = options;
  
  await page.route('**/api/validate-invitation', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ valid, email })
    });
  });
}

/**
 * Setup authenticated state with all necessary mocks
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Setup options
 * @param {string} options.email - User email
 * @param {boolean} options.isAdmin - Whether user is admin
 * @param {Array} options.files - Initial files list
 */
export async function setupAuthenticatedState(page, options = {}) {
  const { email = 'test@example.com', isAdmin = false, files = [] } = options;
  
  // Set token
  await page.goto('/app');
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock-token');
  });
  
  // Mock profile
  await mockProfile(page, { email, is_admin: isAdmin });
  
  // Mock files list
  await mockFilesList(page, files);
  
  // Reload to trigger auth check
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForAppReady(page);
  
  // Wait for dashboard
  await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

/**
 * Handle dialog/alert with custom handler
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Function} handler - Dialog handler function
 */
export function setupDialogHandler(page, handler) {
  page.on('dialog', handler);
}

/**
 * Wait for file to appear in file list
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} filename - File name to wait for
 * @param {Object} options - Wait options
 */
export async function waitForFileInList(page, filename, options = {}) {
  const { timeout = 10000 } = options;
  await page.waitForSelector(`text=${filename}`, { timeout, state: 'visible' });
}

/**
 * Select a file from the file list
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} filename - File name to select
 */
export async function selectFile(page, filename) {
  const fileItem = page.getByText(filename).first();
  await fileItem.click();
  await page.waitForTimeout(500);
}

/**
 * Mock processing API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Processing options
 * @param {number} options.jobId - Job ID
 * @param {string} options.status - Job status
 */
export async function mockProcessing(page, options = {}) {
  const { jobId = 1, status = 'completed' } = options;
  
  await page.route('**/api/process/*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ job_id: jobId, status })
    });
  });
}

/**
 * Mock job status API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Job status options
 * @param {number} options.jobId - Job ID
 * @param {string} options.status - Job status (pending, processing, completed, failed)
 * @param {Object} options.result - Job result data
 */
export async function mockJobStatus(page, options = {}) {
  const { jobId = 1, status = 'completed', result = {} } = options;
  
  await page.route(`**/api/job-status/${jobId}`, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ job_id: jobId, status, ...result })
    });
  });
}
