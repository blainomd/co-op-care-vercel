import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads and contains "co-op.care" text', async ({ page }) => {
    // The page title includes "co-op.care"
    await expect(page).toHaveTitle(/co-op\.care/);

    // The brand name should be present in the page body
    await expect(page.locator('body')).toContainText('co-op.care');
  });

  test('hero section is visible with "You\'re not failing" text', async ({ page }) => {
    const heroText = page.getByText("You're not failing", { exact: false });
    await expect(heroText.first()).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    // Desktop navigation links from the Website component
    const navLinks = ['AI Guide', 'The Conductor', 'Five Sources', 'How It Works', 'Platform', 'The Numbers'];

    for (const linkText of navLinks) {
      const link = page.getByRole('link', { name: linkText });
      // At least one instance of each link should exist (mobile + desktop)
      await expect(link.first()).toBeAttached();
    }
  });

  test('"Get Started" button exists', async ({ page }) => {
    const getStartedButton = page.getByRole('button', { name: /Get Started/i });
    // There are two Get Started buttons (mobile + desktop nav)
    await expect(getStartedButton.first()).toBeAttached();
  });

  test('stats section shows "63M", "27 hrs", "$7,200", "77%"', async ({ page }) => {
    const stats = ['63M', '27 hrs', '$7,200', '77%'];

    for (const stat of stats) {
      const statElement = page.getByText(stat, { exact: false });
      await expect(statElement.first()).toBeVisible();
    }
  });
});
