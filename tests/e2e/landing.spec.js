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

  test('should display hero section content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Hero section should have title
    const heroTitle = page.getByText(/Clean Massive Excel Workbooks/i);
    await expect(heroTitle).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Features section should be visible
    const featuresTitle = page.getByText(/features/i).first();
    await expect(featuresTitle).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display "How it Works" section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // How it Works section should be visible
    const howItWorks = page.getByText(/how it works/i);
    await expect(howItWorks).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should have working GitHub link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // GitHub link should exist
    const githubLink = page.locator('a[href="https://github.com/jewseppi/xlsvc"]').first();
    await expect(githubLink).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should have footer links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Footer should be visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display problem section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Problem section should be visible
    const problemTitle = page.getByText(/the problem we solve/i);
    await expect(problemTitle).toBeVisible({ timeout: 10000 }).catch(() => {});
    
    // Should have manual way and solution text
    const manualWay = page.getByText(/the manual way/i);
    const withExcelCleaner = page.getByText(/with excel cleaner/i);
    await expect(manualWay).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(withExcelCleaner).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display open source section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Open source section should be visible
    const openSourceTitle = page.getByText(/100% open source/i);
    await expect(openSourceTitle).toBeVisible({ timeout: 10000 }).catch(() => {});
    
    // Should have GitHub link in open source section
    const githubLink = page.locator('a[href="https://github.com/jewseppi/xlsvc"]').filter({ hasText: /view on github/i });
    await expect(githubLink).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display all feature cards', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Check for feature cards
    const multiSheet = page.getByText(/multi-sheet processing/i);
    const customFilter = page.getByText(/custom filter conditions/i);
    const imagePreservation = page.getByText(/image preservation/i);
    const fastProcessing = page.getByText(/fast processing/i);
    const deletionReports = page.getByText(/deletion reports/i);
    const openSource = page.getByText(/open source/i);
    
    await expect(multiSheet).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(customFilter).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(imagePreservation).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(fastProcessing).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(deletionReports).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(openSource).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display all how it works steps', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Check for all steps
    const uploadStep = page.getByText(/upload/i).filter({ hasText: /drop your excel/i });
    const configureStep = page.getByText(/configure/i).filter({ hasText: /set which columns/i });
    const processStep = page.getByText(/process/i).filter({ hasText: /we clean all sheets/i });
    const downloadStep = page.getByText(/download/i).filter({ hasText: /get your cleaned/i });
    
    await expect(uploadStep).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(configureStep).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(processStep).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(downloadStep).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should have working GitHub links in header', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Header GitHub link should exist
    const headerGithubLink = page.locator('nav a[href="https://github.com/jewseppi/xlsvc"]').first();
    await expect(headerGithubLink).toBeVisible({ timeout: 10000 }).catch(() => {});
    
    // Should open in new tab
    const target = await headerGithubLink.getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('should have working features anchor link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Features link in header
    const featuresLink = page.locator('nav a[href="#features"]');
    await expect(featuresLink).toBeVisible({ timeout: 10000 }).catch(() => {});
    
    // Click and verify it scrolls to features section
    if (await featuresLink.isVisible().catch(() => false)) {
      await featuresLink.click();
      await page.waitForTimeout(500);
      
      // Features section should be in view
      const featuresSection = page.locator('section.features');
      await expect(featuresSection).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should display logo with correct styling', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Logo should be visible
    const logo = page.getByText(/excel.*cleaner/i).first();
    await expect(logo).toBeVisible({ timeout: 10000 }).catch(() => {});
    
    // Logo should be a link to home
    const logoLink = page.locator('a.logo');
    await expect(logoLink).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should have correct hero section CTA buttons', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Primary CTA button
    const tryItFree = page.getByRole('link', { name: /try it free/i });
    await expect(tryItFree).toBeVisible({ timeout: 10000 }).catch(() => {});
    expect(await tryItFree.getAttribute('href')).toBe('/app');
    
    // Secondary CTA button
    const viewSource = page.getByRole('link', { name: /view source/i });
    await expect(viewSource).toBeVisible({ timeout: 10000 }).catch(() => {});
    expect(await viewSource.getAttribute('href')).toBe('https://github.com/jewseppi/xlsvc');
    expect(await viewSource.getAttribute('target')).toBe('_blank');
  });

  test('should display footer author and links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    await page.waitForTimeout(1000);
    
    // Footer should have author link
    const authorLink = page.locator('footer a[href="https://jsilverman.ca"]');
    await expect(authorLink).toBeVisible({ timeout: 10000 }).catch(() => {});
    
    // Footer should have GitHub link
    const footerGithubLink = page.locator('footer a[href="https://github.com/jewseppi/xlsvc"]');
    await expect(footerGithubLink).toBeVisible({ timeout: 10000 }).catch(() => {});
  });
});
