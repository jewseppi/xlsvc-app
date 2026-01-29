/**
 * E2E test fixtures with V8 coverage collection.
 * Coverage is reported to monocart-reporter and enforced at 100% in playwright.config.js.
 */
import { test as testBase, expect } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

const test = testBase.extend({
  autoTestFixture: [
    async ({ page }, use, testInfo) => {
      const isChromium = testInfo.project.name === 'chromium';
      if (isChromium) {
        await Promise.all([
          page.coverage.startJSCoverage({ resetOnNavigation: false }),
          page.coverage.startCSSCoverage({ resetOnNavigation: false }),
        ]);
      }
      await use();
      if (isChromium) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);
        const coverageList = [...jsCoverage, ...cssCoverage];
        await addCoverageReport(coverageList, testInfo);
      }
    },
    { scope: 'test', auto: true },
  ],
});

export { test, expect };
