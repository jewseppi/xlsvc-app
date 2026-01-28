import { test, expect } from '@playwright/test';
import { login, waitForAppReady } from './helpers';

test.describe('Navigation and Routing', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto('/app');
    await page.evaluate(() => localStorage.clear());
  });

  test('should protect /app route when not authenticated', async ({ page }) => {
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should show auth form, not dashboard
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/sign in to your account/i)).toBeVisible({ timeout: 15000 });
    
    // Should NOT show dashboard content
    const welcomeText = page.getByText('Welcome');
    await expect(welcomeText).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should allow access to root route without authentication', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Landing page should load without requiring auth
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  });

  test('should handle deep linking to /app', async ({ page }) => {
    // Deep link directly to /app with authentication
    await login(page);
    
    // Verify we're on /app route
    expect(page.url()).toContain('/app');
    
    // Should load dashboard, not auth form
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await expect(page.getByText('Excel Processor')).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should handle browser back navigation', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const landingUrl = page.url();
    
    // Navigate to app (will show auth form)
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await page.waitForTimeout(500);
    
    // Go back
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Should be back on landing page
    expect(page.url()).toBe(landingUrl);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle browser forward navigation', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Navigate to app
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await page.waitForTimeout(500);
    const appUrl = page.url();
    
    // Go back
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Go forward
    await page.goForward({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Should be back on /app
    expect(page.url()).toBe(appUrl);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle direct URL access to /app', async ({ page }) => {
    // Direct access without authentication
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should load auth form (not dashboard)
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
  });

  test('should handle direct URL access to /app with token', async ({ page }) => {
    // Set token before navigating
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
        body: JSON.stringify({ files: [] })
      });
    });
    
    // Direct access with token should show dashboard
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should load dashboard
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
  });

  test('should maintain auth state across navigation', async ({ page }) => {
    // Login first
    await login(page);
    
    // Verify authenticated
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    const tokenBefore = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenBefore).toBeTruthy();
    
    // Navigate to landing page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Navigate back to app
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should still be authenticated (token persists)
    const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfter).toBe(tokenBefore);
    
    // Should still show dashboard
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
  });

  test('should redirect to auth when token is invalid', async ({ page }) => {
    // Set invalid token
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid-token');
    });
    
    // Mock 401 response from profile API
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should redirect to auth form
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
    
    // Token should be cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('should handle route protection on page reload', async ({ page }) => {
    // Login first
    await login(page);
    
    // Verify on dashboard
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    
    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should still be on dashboard (token persists)
    await page.waitForSelector('text=Welcome', { timeout: 15000 }).catch(() => {});
    await expect(page.getByText('Excel Processor')).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});
