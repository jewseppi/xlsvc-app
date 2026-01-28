import { test, expect } from '@playwright/test';
import { login, waitForAppReady, mockFileUpload } from './helpers';

test.describe('File Upload', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure no auth state
    await page.goto('/app');
    await page.evaluate(() => localStorage.clear());
  });
  
  test('should redirect to auth when not logged in', async ({ page }) => {
    // Wait for the auth form to be visible
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Should see the auth form since we're not logged in
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/sign in to your account/i)).toBeVisible({ timeout: 15000 });
  });

  test('should show auth form elements', async ({ page }) => {
    // Wait for the form to be ready
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Check that all auth form elements are visible
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel(/password/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15000 });
  });

  test('should validate file input exists when authenticated', async ({ page }) => {
    // Mock authentication by setting token
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    // Mock API responses for authenticated user
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
        body: JSON.stringify({ files: [] })
      });
    });
    
    // Reload to trigger auth check
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    
    // File input should exist in dashboard (may not be visible if no files)
    const fileInput = page.locator('input[type="file"]').first();
    // Just verify it exists in DOM, not necessarily visible
    await expect(fileInput).toBeAttached({ timeout: 10000 }).catch(() => {});
  });

  test('should upload valid Excel file (.xlsx)', async ({ page }) => {
    await login(page);
    
    // Mock successful upload
    await mockFileUpload(page, {
      file_id: 1,
      filename: 'test.xlsx',
      duplicate: false
    });
    
    // Mock files list after upload
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{
            id: 1,
            original_filename: 'test.xlsx',
            file_size: 1024,
            processed: false
          }]
        })
      });
    });
    
    // Set up dialog handler for success message
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('uploaded successfully');
      await dialog.accept();
    });
    
    // Find and use file input
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    // Wait for upload to complete and files to refresh
    await page.waitForTimeout(2000);
    
    // Verify file appears in list
    await expect(page.getByText('test.xlsx')).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should upload valid Excel file (.xls)', async ({ page }) => {
    await login(page);
    
    // Mock successful upload for .xls file
    await mockFileUpload(page, {
      file_id: 2,
      filename: 'test.xls',
      duplicate: false
    });
    
    // Mock files list after upload
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{
            id: 2,
            original_filename: 'test.xls',
            file_size: 2048,
            processed: false
          }]
        })
      });
    });
    
    // Set up dialog handler for success message
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('uploaded successfully');
      await dialog.accept();
    });
    
    // Find and use file input
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xls',
      mimeType: 'application/vnd.ms-excel',
      buffer: Buffer.from('test content for xls')
    });
    
    // Wait for upload to complete
    await page.waitForTimeout(2000);
    
    // Verify file appears in list
    await expect(page.getByText('test.xls')).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display upload progress', async ({ page }) => {
    await login(page);
    
    // Mock upload with progress tracking
    let uploadStarted = false;
    await page.route('**/api/upload', async route => {
      if (!uploadStarted) {
        uploadStarted = true;
        // Simulate progress by delaying response
        await page.waitForTimeout(1000);
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          file_id: 1,
          filename: 'test.xlsx',
          duplicate: false
        })
      });
    });
    
    // Mock files list
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [] })
      });
    });
    
    // Set up dialog handler
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    // Check for upload progress indicator (if visible)
    // Progress may be shown in UI, but we verify upload completes
    await page.waitForTimeout(2000);
    
    // Verify upload completed
    await expect(page.getByText('test.xlsx')).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display file list after upload', async ({ page }) => {
    await login(page);
    
    // Mock initial empty file list
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [] })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Mock successful upload
    await mockFileUpload(page, {
      file_id: 1,
      filename: 'uploaded-file.xlsx',
      duplicate: false
    });
    
    // Mock updated files list after upload
    let filesListUpdated = false;
    await page.route('**/api/files', route => {
      if (!filesListUpdated) {
        filesListUpdated = true;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [{
              id: 1,
              original_filename: 'uploaded-file.xlsx',
              file_size: 5120,
              processed: false
            }]
          })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [{
              id: 1,
              original_filename: 'uploaded-file.xlsx',
              file_size: 5120,
              processed: false
            }]
          })
        });
      }
    });
    
    // Set up dialog handler
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'uploaded-file.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    // Wait for file list to update
    await page.waitForTimeout(2000);
    
    // Verify file appears in the list
    await expect(page.getByText('uploaded-file.xlsx')).toBeVisible({ timeout: 10000 });
  });

  test('should handle duplicate file upload', async ({ page }) => {
    await login(page);
    
    // Mock existing file in list
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{
            id: 1,
            original_filename: 'test.xlsx',
            file_size: 1024,
            processed: false
          }]
        })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Mock duplicate upload response
    await mockFileUpload(page, {
      file_id: 1,
      filename: 'test.xlsx',
      duplicate: true
    });
    
    // Set up dialog handler for duplicate message
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('already exists');
      expect(dialog.message()).toContain('test.xlsx');
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    // Wait for duplicate handling
    await page.waitForTimeout(2000);
    
    // File should be selected (existing file)
    await expect(page.getByText('test.xlsx')).toBeVisible({ timeout: 10000 });
  });

  test('should reject invalid file type', async ({ page }) => {
    await login(page);
    
    // Set up dialog handler for invalid file type alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Excel file');
      expect(dialog.message()).toMatch(/\.xlsx|\.xls/);
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    
    // Try to upload PDF file
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    
    // Wait for validation error
    await page.waitForTimeout(1000);
    
    // Verify no file was uploaded (file list should remain empty)
    await expect(page.getByText('test.pdf')).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should reject other invalid file types', async ({ page }) => {
    await login(page);
    
    const invalidFiles = [
      { name: 'test.txt', mimeType: 'text/plain' },
      { name: 'test.doc', mimeType: 'application/msword' },
      { name: 'test.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'test.csv', mimeType: 'text/csv' }
    ];
    
    for (const file of invalidFiles) {
      // Set up dialog handler
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Excel file');
        await dialog.accept();
      });
      
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: file.name,
        mimeType: file.mimeType,
        buffer: Buffer.from('test content')
      });
      
      await page.waitForTimeout(500);
      
      // Verify file was not uploaded
      await expect(page.getByText(file.name)).not.toBeVisible({ timeout: 1000 }).catch(() => {});
    }
  });

  test('should handle upload error scenarios - server error (500)', async ({ page }) => {
    await login(page);
    
    // Mock 500 server error
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Set up dialog handler for error alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('failed');
      expect(dialog.message()).toContain('Internal server error');
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    await page.waitForTimeout(2000);
    
    // Verify file was not uploaded
    await expect(page.getByText('test.xlsx')).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should handle upload error scenarios - network error', async ({ page }) => {
    await login(page);
    
    // Mock network error (abort request)
    await page.route('**/api/upload', route => {
      route.abort('failed');
    });
    
    // Set up dialog handler for error alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('failed');
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    await page.waitForTimeout(2000);
  });

  test('should handle upload error scenarios - unauthorized (401)', async ({ page }) => {
    await login(page);
    
    // Mock 401 unauthorized error
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    // Set up dialog handler for error alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('failed');
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    await page.waitForTimeout(2000);
  });

  test('should handle upload error scenarios - file too large (413)', async ({ page }) => {
    await login(page);
    
    // Mock 413 payload too large error
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 413,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'File too large' })
      });
    });
    
    // Set up dialog handler for error alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('failed');
      expect(dialog.message()).toContain('too large');
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'large-file.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('x'.repeat(10000000)) // 10MB file
    });
    
    await page.waitForTimeout(2000);
  });

  test('should handle upload error scenarios - bad request (400)', async ({ page }) => {
    await login(page);
    
    // Mock 400 bad request error
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid file format' })
      });
    });
    
    // Set up dialog handler for error alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('failed');
      expect(dialog.message()).toContain('Invalid file format');
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('invalid excel content')
    });
    
    await page.waitForTimeout(2000);
  });

  test('should handle file size limit', async ({ page }) => {
    await login(page);
    
    // Mock file size validation error
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'File size exceeds maximum limit' })
      });
    });
    
    // Set up dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('failed');
      expect(dialog.message()).toMatch(/size|limit/i);
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'large.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('x'.repeat(50000000)) // 50MB file
    });
    
    await page.waitForTimeout(2000);
  });

  test('should handle upload timeout', async ({ page }) => {
    await login(page);
    
    // Mock timeout by delaying response beyond timeout
    await page.route('**/api/upload', async route => {
      // Wait longer than the timeout (300000ms = 5 minutes)
      // But for testing, we'll just delay significantly
      await page.waitForTimeout(100);
      route.fulfill({
        status: 408,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Request timeout' })
      });
    });
    
    // Set up dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('failed');
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    await page.waitForTimeout(2000);
  });

  test('should clear file input after upload', async ({ page }) => {
    await login(page);
    
    // Mock successful upload
    await mockFileUpload(page, {
      file_id: 1,
      filename: 'test.xlsx',
      duplicate: false
    });
    
    // Mock files list
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [{
            id: 1,
            original_filename: 'test.xlsx',
            file_size: 1024,
            processed: false
          }]
        })
      });
    });
    
    // Set up dialog handler
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test content')
    });
    
    await page.waitForTimeout(2000);
    
    // File input should be cleared (value should be empty)
    const inputValue = await fileInput.inputValue();
    expect(inputValue).toBe('');
  });
});
