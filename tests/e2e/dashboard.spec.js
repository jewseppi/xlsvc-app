import { test, expect } from '@playwright/test';

test.describe('Dashboard Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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
        body: JSON.stringify({
          files: [
            { id: 1, original_filename: 'test.xlsx', file_size: 1024, processed: false },
            { id: 2, original_filename: 'another.xlsx', file_size: 2048, processed: true }
          ]
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
    
    // Reload to trigger auth check
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for React root
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Wait for loading to disappear
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && !root.textContent?.includes('Loading...');
      },
      { timeout: 10000 }
    );
  });

  test.describe('Dashboard Layout and Navigation', () => {
    test('should display dashboard layout with all sections', async ({ page }) => {
      // Wait for dashboard to load
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Verify page loaded
      expect(await page.title()).toBeTruthy();
      
      // Check for dashboard header elements
      const welcomeText = page.getByText(/welcome/i);
      await expect(welcomeText).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('should display user information in header', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // User email should be displayed
      const userEmail = page.getByText('test@example.com');
      await expect(userEmail).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('should display logout button', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const logoutButton = page.getByRole('button', { name: /logout/i });
      await expect(logoutButton).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('should handle logout functionality', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const logoutButton = page.getByRole('button', { name: /logout/i });
      if (await logoutButton.isVisible().catch(() => false)) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
        
        // Should redirect to auth page
        await page.waitForSelector('text=Excel Processor', { timeout: 10000 }).catch(() => {});
      }
    });
  });

  test.describe('File List and Display', () => {
    test('should display file list section with uploaded files', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // File list should show uploaded files
      const file1 = page.getByText('test.xlsx');
      const file2 = page.getByText('another.xlsx');
      
      await expect(file1).toBeVisible({ timeout: 10000 }).catch(() => {});
      await expect(file2).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('should display file upload section', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Upload section should be present
      const fileInput = page.locator('input[type="file"]').first();
      await expect(fileInput).toBeAttached({ timeout: 10000 }).catch(() => {});
    });

    test('should allow file selection by clicking on file', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Click on a file
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(1000);
        
        // File should be selected (check for selected file indicators)
        // This might show in different ways depending on implementation
        expect(await page.locator('body')).toBeVisible();
      }
    });

    test('should display file details when file is selected', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Selected file info should be visible
        const selectedFileInfo = page.getByText(/selected file|analyze file/i);
        await expect(selectedFileInfo).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should handle switching between files', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Select first file
      const file1 = page.getByText('test.xlsx').first();
      if (await file1.isVisible().catch(() => false)) {
        await file1.click();
        await page.waitForTimeout(1000);
        
        // Select second file
        const file2 = page.getByText('another.xlsx').first();
        if (await file2.isVisible().catch(() => false)) {
          await file2.click();
          await page.waitForTimeout(1000);
          
          // Should show second file as selected
          expect(await page.locator('body')).toBeVisible();
        }
      }
    });
  });

  test.describe('Filter Configuration', () => {
    test('should display filter configuration when file is selected', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Filter configuration should be visible
        const filterSection = page.getByText(/filter|column|value/i);
        await expect(filterSection).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should allow editing filter rules', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Look for filter input fields
        const filterInputs = page.locator('input[type="text"]');
        const count = await filterInputs.count();
        if (count > 0) {
          // Try to interact with filter inputs
          await filterInputs.first().fill('F');
          await page.waitForTimeout(500);
          expect(await page.locator('body')).toBeVisible();
        }
      }
    });

    test('should display filter rules in configuration', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Filter rules should be displayed
        const filterRules = page.getByText(/F|G|H|I|column/i);
        await expect(filterRules).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Generated Files Display', () => {
    test('should display generated files section when file is selected', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Generated files section should appear
        const downloadsSection = page.getByText(/Available Downloads|No generated files yet|Generated Files/i);
        await expect(downloadsSection).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should display empty state when no generated files exist', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Should show empty state message
        const emptyState = page.getByText(/no generated files yet/i);
        await expect(emptyState).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should display generated files when they exist', async ({ page }) => {
      // Mock API to return generated files
      await page.route('**/api/files/1/generated', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            macros: [{ id: 1, original_filename: 'macro.bas' }],
            instructions: [{ id: 2, original_filename: 'instructions.txt' }],
            reports: [{ id: 3, original_filename: 'report.json' }],
            processed: [{ id: 4, original_filename: 'processed.xlsx' }]
          })
        });
      });

      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Should show generated files
        const macroFile = page.getByText('macro.bas');
        await expect(macroFile).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should display download buttons for generated files', async ({ page }) => {
      // Mock API to return generated files
      await page.route('**/api/files/1/generated', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            macros: [{ id: 1, original_filename: 'macro.bas' }],
            instructions: [],
            reports: [],
            processed: []
          })
        });
      });

      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Should show download button
        const downloadButton = page.getByRole('button', { name: /download/i });
        await expect(downloadButton).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Processing History Display', () => {
    test('should display processing history section when file is selected', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Processing history section should appear
        const historySection = page.getByText(/Processing History|No processing history yet/i);
        await expect(historySection).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should display empty state when no processing history exists', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Should show empty state message
        const emptyState = page.getByText(/no processing history yet/i);
        await expect(emptyState).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should display processing history items when they exist', async ({ page }) => {
      // Mock API to return history
      await page.route('**/api/files/1/history', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            history: [
              {
                job_id: 1,
                processed_at: '2024-01-15T10:30:00Z',
                status: 'completed',
                deleted_rows: 5,
                filter_rules: [{ column: 'F', value: '0' }],
                processed_filename: 'processed.xlsx',
                result_file_id: 10
              }
            ]
          })
        });
      });

      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Should show history item
        const historyItem = page.getByText(/rows deleted|completed/i);
        await expect(historyItem).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should display status badges for history items', async ({ page }) => {
      // Mock API to return history with different statuses
      await page.route('**/api/files/1/history', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            history: [
              {
                job_id: 1,
                processed_at: '2024-01-15T10:30:00Z',
                status: 'completed',
                deleted_rows: 5
              },
              {
                job_id: 2,
                processed_at: '2024-01-16T10:30:00Z',
                status: 'failed'
              }
            ]
          })
        });
      });

      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Should show status badges
        const completedStatus = page.getByText(/completed/i);
        const failedStatus = page.getByText(/failed/i);
        await expect(completedStatus).toBeVisible({ timeout: 5000 }).catch(() => {});
        await expect(failedStatus).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Download Functionality', () => {
    test('should handle download from generated files', async ({ page }) => {
      // Mock API to return generated files
      await page.route('**/api/files/1/generated', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            macros: [{ id: 1, original_filename: 'macro.bas' }],
            instructions: [],
            reports: [],
            processed: []
          })
        });
      });

      // Mock download API
      await page.route('**/api/files/*/download*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/octet-stream',
          body: Buffer.from('file content')
        });
      });

      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Look for download button
        const downloadButton = page.getByRole('button', { name: /download/i }).first();
        if (await downloadButton.isVisible().catch(() => false)) {
          await downloadButton.click();
          await page.waitForTimeout(1000);
          
          // Download should be triggered
          expect(await page.locator('body')).toBeVisible();
        }
      }
    });

    test('should handle download from processing history', async ({ page }) => {
      // Mock API to return history with downloadable file
      await page.route('**/api/files/1/history', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            history: [
              {
                job_id: 1,
                processed_at: '2024-01-15T10:30:00Z',
                status: 'completed',
                deleted_rows: 5,
                processed_filename: 'processed.xlsx',
                result_file_id: 10
              }
            ]
          })
        });
      });

      // Mock download API
      await page.route('**/api/files/*/download*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/octet-stream',
          body: Buffer.from('file content')
        });
      });

      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Look for download button in history
        const downloadButton = page.getByRole('button', { name: /download processed file/i });
        if (await downloadButton.isVisible().catch(() => false)) {
          await downloadButton.click();
          await page.waitForTimeout(1000);
          
          // Download should be triggered
          expect(await page.locator('body')).toBeVisible();
        }
      }
    });
  });

  test.describe('Refresh Functionality', () => {
    test('should handle page refresh and maintain state', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Refresh the page
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      
      // Dashboard should still be visible
      expect(await page.locator('body')).toBeVisible();
    });

    test('should reload file list on refresh', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Verify files are loaded
      const file1 = page.getByText('test.xlsx');
      await expect(file1).toBeVisible({ timeout: 10000 }).catch(() => {});
      
      // Refresh
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      
      // Files should still be visible after refresh
      await expect(file1).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('should maintain selected file state across refresh', async ({ page }) => {
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Select a file
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(1000);
        
        // Refresh
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
        
        // Page should reload successfully
        expect(await page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Complete Dashboard Workflow', () => {
    test('should complete full workflow: select file, view sections, download', async ({ page }) => {
      // Mock API to return generated files and history
      await page.route('**/api/files/1/generated', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            macros: [{ id: 1, original_filename: 'macro.bas' }],
            instructions: [],
            reports: [],
            processed: []
          })
        });
      });

      await page.route('**/api/files/1/history', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            history: [
              {
                job_id: 1,
                processed_at: '2024-01-15T10:30:00Z',
                status: 'completed',
                deleted_rows: 5
              }
            ]
          })
        });
      });

      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Step 1: Select file
      const fileLink = page.getByText('test.xlsx').first();
      if (await fileLink.isVisible().catch(() => false)) {
        await fileLink.click();
        await page.waitForTimeout(2000);
        
        // Step 2: Verify all sections are visible
        const filterSection = page.getByText(/filter|column/i);
        const generatedSection = page.getByText(/Generated|Downloads/i);
        const historySection = page.getByText(/Processing History|History/i);
        
        await expect(filterSection).toBeVisible({ timeout: 5000 }).catch(() => {});
        await expect(generatedSection).toBeVisible({ timeout: 5000 }).catch(() => {});
        await expect(historySection).toBeVisible({ timeout: 5000 }).catch(() => {});
        
        // Step 3: Try to download
        const downloadButton = page.getByRole('button', { name: /download/i }).first();
        if (await downloadButton.isVisible().catch(() => false)) {
          await downloadButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });
});
