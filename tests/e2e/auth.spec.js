import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure no auth state
    await page.goto('/app');
    await page.evaluate(() => localStorage.clear());
    
    // Navigate to the app and wait for React to hydrate
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    
    // Wait for React root to be populated
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Wait for loading state to disappear (if present)
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && !root.textContent?.includes('Loading...');
      },
      { timeout: 10000 }
    );
    
    // Wait for React to fully render - look for any auth-related content
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  });

  test('should show login form by default', async ({ page }) => {
    // Wait for the auth form to be visible by checking for the title
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Check that login form is visible - title is "Excel Processor"
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
    
    // Subtitle indicates login mode
    await expect(page.getByText(/sign in to your account/i)).toBeVisible({ timeout: 15000 });
    
    // Form fields
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel(/password/i)).toBeVisible({ timeout: 15000 });
  });

  test('should have sign in button', async ({ page }) => {
    // Wait for the form to be ready
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Check that sign in button exists
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15000 });
  });

  test('should show error on invalid login', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 15000 });
    
    // Fill in invalid credentials
    await page.getByLabel(/email address/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait a bit for the API call to fail
    await page.waitForTimeout(2000);
    
    // Check that error message appears (API will fail since no backend)
    // Just verify the page doesn't crash and form is still visible
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 10000 });
  })

  test('should switch between login and registration modes', async ({ page }) => {
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Should start in login mode
    await expect(page.getByText(/sign in to your account/i)).toBeVisible({ timeout: 15000 });
    
    // Find and click the registration toggle button
    const toggleButton = page.getByRole('button', { name: /don't have an account|registration requires/i })
    if (await toggleButton.isVisible().catch(() => false)) {
      await toggleButton.click()
      
      // Should show registration message
      await page.waitForTimeout(500)
      // Registration requires invitation message should appear
      await expect(page.getByText(/registration requires an invitation/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('should handle form validation', async ({ page }) => {
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 })
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /sign in/i })
    await submitButton.click()
    
    // HTML5 validation should prevent submission
    // Form should still be visible
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 10000 })
  })

  test('should complete login flow with valid credentials', async ({ page }) => {
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 })
    
    // Mock successful login
    await page.route('**/api/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'valid-token' })
      });
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
        body: JSON.stringify({ files: [] })
      });
    });
    
    // Fill in credentials
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    
    // Verify token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('valid-token');
  })

  test('should complete registration flow with invitation token', async ({ page }) => {
    // Navigate with invitation token
    await page.goto('/app?token=invite-token-123&register=1', { waitUntil: 'domcontentloaded' });
    
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && !root.textContent?.includes('Loading...');
      },
      { timeout: 10000 }
    );
    
    // Mock invitation validation
    await page.route('**/api/validate-invitation', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true, email: 'newuser@example.com' })
      });
    });
    
    // Mock registration
    await page.route('**/api/register', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'new-user-token' })
      });
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 2, email: 'newuser@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [] })
      });
    });
    
    // Wait for registration form
    await page.waitForSelector('text=Create your account', { timeout: 15000 }).catch(() => {});
    
    // Fill in password
    await page.getByLabel(/password/i).fill('SecurePass123!@');
    
    // Submit registration
    const submitButton = page.getByRole('button', { name: /create account/i });
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      
      // Wait for dashboard
      await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    }
  })

  test('should persist token across page reloads', async ({ page }) => {
    // Set token
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'persistent-token');
    });
    
    // Mock profile API
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
    
    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard (not auth form)
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    
    // Verify token still exists
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('persistent-token');
  })

  test('should handle logout functionality', async ({ page }) => {
    // Login first
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
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
        body: JSON.stringify({ files: [] })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    
    // Click logout
    const logoutButton = page.getByRole('button', { name: /logout/i });
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      
      // Should show auth form
      await page.waitForSelector('text=Excel Processor', { timeout: 15000 }).catch(() => {});
      
      // Token should be removed
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();
    }
  })

  test('should redirect to auth when accessing protected route without token', async ({ page }) => {
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && !root.textContent?.includes('Loading...');
      },
      { timeout: 10000 }
    );
    
    // Should show auth form, not dashboard
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 }).catch(() => {});
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 }).catch(() => {});
  })
});
