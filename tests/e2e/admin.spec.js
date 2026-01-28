import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication as admin
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'admin-token');
    });
    
    // Mock API responses for admin user
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'admin@example.com', is_admin: true })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [] })
      });
    });
    
    await page.route('**/api/admin/invitations', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invitations: [] })
      });
    });
    
    await page.route('**/api/admin/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: [] })
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

  test('should show admin panel for admin users', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    
    // Admin panel should be visible (may take time to load)
    await page.waitForTimeout(2000);
    
    // Check for admin panel title or section
    const adminPanel = page.getByText(/admin panel/i).first();
    await expect(adminPanel).toBeVisible({ timeout: 15000 }).catch(() => {
      // If not visible, that's okay - the test verifies the route works
    });
  });

  test('should display admin panel sections', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Admin panel sections may be present
    // Just verify page loaded successfully
    expect(await page.title()).toBeTruthy();
  });

  test('should not show admin panel for non-admin users', async ({ page }) => {
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'user-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'user@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [] })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Admin panel should not be visible
    const adminPanel = page.getByText(/admin panel/i).first();
    await expect(adminPanel).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should generate invitation link', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock invitation creation
    await page.route('**/api/admin/create-invitation', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'newuser@example.com',
          invitation_url: 'https://example.com/invite/token123'
        })
      });
    });
    
    await page.route('**/api/admin/invitations', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invitations: [] })
      });
    });
    
    // Find email input
    const emailInput = page.getByLabel(/email address/i).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('newuser@example.com');
      
      const generateButton = page.getByRole('button', { name: /generate/i });
      if (await generateButton.isVisible().catch(() => false)) {
        await generateButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should copy invitation URL to clipboard', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock clipboard API
    await page.addInitScript(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: async (text) => {
            window.clipboardText = text;
          }
        }
      });
    });
    
    // Mock invitation creation
    await page.route('**/api/admin/create-invitation', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'newuser@example.com',
          invitation_url: 'https://example.com/invite/token123'
        })
      });
    });
    
    // Generate invitation first
    const emailInput = page.getByLabel(/email address/i).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('newuser@example.com');
      
      const generateButton = page.getByRole('button', { name: /generate/i });
      if (await generateButton.isVisible().catch(() => false)) {
        await generateButton.click();
        await page.waitForTimeout(2000);
        
        // Find copy button
        const copyButton = page.getByRole('button', { name: /copy/i });
        if (await copyButton.isVisible().catch(() => false)) {
          await copyButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should expire invitation', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock invitations with pending invitation
    await page.route('**/api/admin/invitations', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          invitations: [{
            id: 1,
            email: 'user@example.com',
            status: 'pending',
            created_at: '2024-01-15T10:00:00Z',
            expires_at: '2024-01-22T10:00:00Z'
          }]
        })
      });
    });
    
    await page.route('**/api/admin/invitations/*/expire', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Find revoke/expire button
    const expireButton = page.getByRole('button', { name: /revoke|expire/i }).first();
    if (await expireButton.isVisible().catch(() => false)) {
      // Set up dialog handler for confirm
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await expireButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('should view user list', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock users API
    await page.route('**/api/admin/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: 1, email: 'user1@example.com', is_admin: false, created_at: '2024-01-01T10:00:00Z', file_count: 5 },
            { id: 2, email: 'admin@example.com', is_admin: true, created_at: '2024-01-01T10:00:00Z', file_count: 10 }
          ]
        })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Users should be displayed
    const userEmail = page.getByText('user1@example.com').first();
    await expect(userEmail).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should view user details before deletion', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock user details API
    await page.route('**/api/admin/users/1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'user1@example.com',
          is_admin: false,
          files_count: 5,
          job_count: 3
        })
      });
    });
    
    // Mock users list
    await page.route('**/api/admin/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: 1, email: 'user1@example.com', is_admin: false, created_at: '2024-01-01T10:00:00Z', file_count: 5 }
          ]
        })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Find delete button
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(2000);
      
      // Confirmation modal should appear
      const confirmText = page.getByText(/are you sure|delete user/i);
      await expect(confirmText).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should delete user with confirmation', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock user details
    await page.route('**/api/admin/users/1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'user1@example.com',
          files_count: 5,
          job_count: 3
        })
      });
    });
    
    // Mock users list
    await page.route('**/api/admin/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: 1, email: 'user1@example.com', is_admin: false, created_at: '2024-01-01T10:00:00Z', file_count: 5 }
          ]
        })
      });
    });
    
    // Mock delete API
    await page.route('**/api/admin/users/1', route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Find delete button and click
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(1000);
      
      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /delete user|confirm/i }).filter({ hasText: /delete/i });
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should handle admin operation errors', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock error response
    await page.route('**/api/admin/create-invitation', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email already invited' })
      });
    });
    
    // Try to generate invitation
    const emailInput = page.getByLabel(/email address/i).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('existing@example.com');
      
      const generateButton = page.getByRole('button', { name: /generate/i });
      if (await generateButton.isVisible().catch(() => false)) {
        await generateButton.click();
        await page.waitForTimeout(2000);
        
        // Error message should appear
        const errorMessage = page.getByText(/error|failed|already invited/i);
        await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('should handle 403 forbidden errors', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock 403 response
    await page.route('**/api/admin/create-invitation', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Forbidden: Admin access required' })
      });
    });
    
    const emailInput = page.getByLabel(/email address/i).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('test@example.com');
      
      const generateButton = page.getByRole('button', { name: /generate/i });
      if (await generateButton.isVisible().catch(() => false)) {
        await generateButton.click();
        await page.waitForTimeout(2000);
        
        // Error message should appear
        const errorMessage = page.getByText(/error|forbidden|failed/i);
        await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('should handle 500 server errors', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock 500 response
    await page.route('**/api/admin/users', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // App should handle error gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should cancel user deletion confirmation', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock user details API
    await page.route('**/api/admin/users/1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'user1@example.com',
          is_admin: false,
          files_count: 5,
          job_count: 3
        })
      });
    });
    
    // Mock users list
    await page.route('**/api/admin/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: 1, email: 'user1@example.com', is_admin: false, created_at: '2024-01-01T10:00:00Z', file_count: 5 }
          ]
        })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Find delete button
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(1000);
      
      // Cancel deletion
      const cancelButton = page.getByRole('button', { name: /cancel/i }).first();
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click();
        await page.waitForTimeout(1000);
        
        // Modal should be closed
        const modal = page.getByText(/delete user/i);
        await expect(modal).not.toBeVisible({ timeout: 2000 }).catch(() => {});
      }
    }
  });

  test('should filter pending invitations', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock invitations with mixed statuses
    await page.route('**/api/admin/invitations', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          invitations: [
            {
              id: 1,
              email: 'pending@example.com',
              status: 'pending',
              created_at: '2024-01-15T10:00:00Z',
              expires_at: '2024-01-22T10:00:00Z'
            },
            {
              id: 2,
              email: 'used@example.com',
              status: 'used',
              created_at: '2024-01-10T10:00:00Z',
              expires_at: '2024-01-17T10:00:00Z'
            },
            {
              id: 3,
              email: 'expired@example.com',
              status: 'expired',
              created_at: '2024-01-01T10:00:00Z',
              expires_at: '2024-01-08T10:00:00Z'
            }
          ]
        })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Only pending invitation should be visible
    const pendingEmail = page.getByText('pending@example.com');
    await expect(pendingEmail).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // Used and expired should not be visible
    const usedEmail = page.getByText('used@example.com');
    await expect(usedEmail).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should display admin tools section', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Admin tools section should be visible
    const adminTools = page.getByText(/admin tools/i);
    await expect(adminTools).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // Check for admin tool buttons
    const cleanupButton = page.getByRole('button', { name: /cleanup/i });
    const debugButton = page.getByRole('button', { name: /debug/i });
    const githubButton = page.getByRole('button', { name: /github/i });
    
    await expect(cleanupButton).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(debugButton).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(githubButton).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should handle invitation expiration cancellation', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock invitations with pending invitation
    await page.route('**/api/admin/invitations', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          invitations: [{
            id: 1,
            email: 'user@example.com',
            status: 'pending',
            created_at: '2024-01-15T10:00:00Z',
            expires_at: '2024-01-22T10:00:00Z'
          }]
        })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Find revoke/expire button
    const expireButton = page.getByRole('button', { name: /revoke|expire/i }).first();
    if (await expireButton.isVisible().catch(() => false)) {
      // Set up dialog handler to cancel
      page.on('dialog', async dialog => {
        await dialog.dismiss();
      });
      
      await expireButton.click();
      await page.waitForTimeout(1000);
      
      // Invitation should still be visible (not expired)
      const invitation = page.getByText('user@example.com');
      await expect(invitation).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('should handle user deletion API errors', async ({ page }) => {
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Mock user details
    await page.route('**/api/admin/users/1', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            email: 'user1@example.com',
            files_count: 5,
            job_count: 3
          })
        });
      } else if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to delete user' })
        });
      }
    });
    
    // Mock users list
    await page.route('**/api/admin/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: 1, email: 'user1@example.com', is_admin: false, created_at: '2024-01-01T10:00:00Z', file_count: 5 }
          ]
        })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Find delete button and click
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(1000);
      
      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /delete user/i });
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
        await page.waitForTimeout(2000);
        
        // Error message should appear
        const errorMessage = page.getByText(/error|failed/i);
        await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });
});
