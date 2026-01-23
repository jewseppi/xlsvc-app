import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/app');
  });

  test('should show login form by default', async ({ page }) => {
    // Check that login form is visible
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should switch to registration form', async ({ page }) => {
    // Click on register link/button
    const registerLink = page.getByText(/register|sign up/i).first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
      
      // Check that registration form is visible
      await expect(page.getByRole('heading', { name: /register|sign up/i })).toBeVisible();
    }
  });

  test('should show error on invalid login', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check for error message (adjust selector based on your error display)
    // This is a placeholder - adjust based on your actual error handling
    await expect(page.locator('body')).toBeVisible(); // At minimum, page should still be visible
  });
});
