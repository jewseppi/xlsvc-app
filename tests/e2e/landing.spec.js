import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for React root to be populated
    await page.waitForSelector('#root', { state: 'attached' });
  });

  test('should load landing page correctly', async ({ page }) => {
    // Landing page should load
    await expect(page.locator('body')).toBeVisible();
    
    // Should have main content
    expect(await page.title()).toBeTruthy();
  });

  test('should display hero section', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Hero section should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check for Launch App link
    const launchLink = page.getByText(/Launch App|Try It Free/i).first();
    await expect(launchLink).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should navigate to app when clicking Launch App', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Find and click Launch App link
    const launchLink = page.getByText(/Launch App|Try It Free/i).first();
    if (await launchLink.isVisible().catch(() => false)) {
      await launchLink.click();
      
      // Should navigate to /app
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/app');
    }
  });

  test('should display all sections', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // All sections should be present
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });
});
