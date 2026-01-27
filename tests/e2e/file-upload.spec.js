import { test, expect } from '@playwright/test';

test.describe('File Upload', () => {
  // These tests require authentication
  // For now, we test that the auth page loads correctly when not authenticated
  
  test('should redirect to auth when not logged in', async ({ page }) => {
    // Navigate to the app
    await page.goto('/app');
    
    // Should see the auth form since we're not logged in
    await expect(page.getByText('Excel Processor')).toBeVisible();
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });

  test('should show auth form elements', async ({ page }) => {
    await page.goto('/app');
    
    // Check that all auth form elements are visible
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
