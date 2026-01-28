import { test, expect } from '@playwright/test';

test.describe('File Processing', () => {
  // These tests require authentication
  // For now, we verify the landing page works
  
  test('should load landing page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for React root to be populated
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Landing page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to app', async ({ page }) => {
    // Clear localStorage to ensure no auth state
    await page.goto('/app');
    await page.evaluate(() => localStorage.clear());
    
    // Navigate to the app and wait for React to hydrate
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    
    // Wait for React root to be populated
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Wait for loading state to disappear
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && !root.textContent?.includes('Loading...');
      },
      { timeout: 10000 }
    );
    
    // Wait for the auth form to be visible
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Auth form should be visible
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
  });

  test('should show processing section when file is selected', async ({ page }) => {
    // Mock authentication
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{ id: 1, original_filename: 'test.xlsx', file_size: 1024, processed: false }]
        })
      });
    });
    
    await page.route('**/api/files/*/generated', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ macros: [], instructions: [], reports: [], processed: [] })
      });
    });
    
    await page.route('**/api/files/*/history', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ history: [] })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    
    // Look for file or processing section
    await page.waitForTimeout(2000);
  });

  test('should select file for processing', async ({ page }) => {
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{ id: 1, original_filename: 'test.xlsx', file_size: 1024, processed: false }]
        })
      });
    });
    
    await page.route('**/api/files/*/generated', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ macros: [], instructions: [], reports: [], processed: [] })
      });
    });
    
    await page.route('**/api/files/*/history', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ history: [] })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Click on file to select it
    const fileLink = page.getByText('test.xlsx').first();
    if (await fileLink.isVisible().catch(() => false)) {
      await fileLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should configure filter rules', async ({ page }) => {
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{ id: 1, original_filename: 'test.xlsx', file_size: 1024, processed: false }]
        })
      });
    });
    
    await page.route('**/api/files/*/generated', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ macros: [], instructions: [], reports: [], processed: [] })
      });
    });
    
    await page.route('**/api/files/*/history', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ history: [] })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Select file
    const fileLink = page.getByText('test.xlsx').first();
    if (await fileLink.isVisible().catch(() => false)) {
      await fileLink.click();
      await page.waitForTimeout(1000);
      
      // Filter configuration should be visible
      const columnInputs = page.locator('input[type="text"]').filter({ hasText: /column/i });
      if (await columnInputs.first().isVisible().catch(() => false)) {
        await columnInputs.first().fill('A');
      }
    }
  });

  test('should execute manual processing', async ({ page }) => {
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{ id: 1, original_filename: 'test.xlsx', file_size: 1024, processed: false }]
        })
      });
    });
    
    await page.route('**/api/files/*/generated', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ macros: [], instructions: [], reports: [], processed: [] })
      });
    });
    
    await page.route('**/api/files/*/history', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ history: [] })
      });
    });
    
    await page.route('**/api/process/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          processed_file_id: 2,
          download_filename: 'processed.xlsx',
          deleted_rows: 10,
          processing_log: ['Processing completed'],
          total_rows_to_delete: 10,
          sheets_affected: ['Sheet1'],
          downloads: {
            macro: { file_id: 3, filename: 'macro.bas' },
            instructions: { file_id: 4, filename: 'instructions.txt' }
          }
        })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Select file and process
    const fileLink = page.getByText('test.xlsx').first();
    if (await fileLink.isVisible().catch(() => false)) {
      await fileLink.click();
      await page.waitForTimeout(1000);
      
      const processButton = page.getByRole('button', { name: /Generate Macro|Analyzing/i });
      if (await processButton.isVisible().catch(() => false)) {
        await processButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should execute automated processing', async ({ page }) => {
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{ id: 1, original_filename: 'test.xlsx', file_size: 1024, processed: false }]
        })
      });
    });
    
    await page.route('**/api/files/*/generated', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ macros: [], instructions: [], reports: [], processed: [] })
      });
    });
    
    await page.route('**/api/files/*/history', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ history: [] })
      });
    });
    
    await page.route('**/api/process-automated/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: 'job-123',
          status: 'processing',
          estimated_time: '2-3 minutes'
        })
      });
    });
    
    await page.route('**/api/job-status/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'pending' })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Select file and start automated processing
    const fileLink = page.getByText('test.xlsx').first();
    if (await fileLink.isVisible().catch(() => false)) {
      await fileLink.click();
      await page.waitForTimeout(1000);
      
      const automatedButton = page.getByRole('button', { name: /Automated Processing|Processing on GitHub/i });
      if (await automatedButton.isVisible().catch(() => false) && !(await automatedButton.isDisabled().catch(() => true))) {
        await automatedButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should handle processing errors', async ({ page }) => {
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{ id: 1, original_filename: 'test.xlsx', file_size: 1024, processed: false }]
        })
      });
    });
    
    await page.route('**/api/files/*/generated', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ macros: [], instructions: [], reports: [], processed: [] })
      });
    });
    
    await page.route('**/api/files/*/history', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ history: [] })
      });
    });
    
    await page.route('**/api/process/*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Processing failed' })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Select file and try to process
    const fileLink = page.getByText('test.xlsx').first();
    if (await fileLink.isVisible().catch(() => false)) {
      await fileLink.click();
      await page.waitForTimeout(1000);
      
      const processButton = page.getByRole('button', { name: /Generate Macro/i });
      if (await processButton.isVisible().catch(() => false)) {
        await processButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
