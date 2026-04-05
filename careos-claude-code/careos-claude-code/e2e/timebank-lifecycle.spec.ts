/**
 * E2E: Time Bank Task Lifecycle
 *
 * Tests the complete task flow:
 * Browse Tasks → View Task → Accept & Check In → Active Session → Check Out → Gratitude → Credits
 */
import { test, expect } from '@playwright/test';

test.describe('Time Bank Task Lifecycle', () => {
  // Note: These tests require authentication. In CI, we'd mock the auth state.
  // For now, these test the public-accessible parts and the task flow UI.

  test.describe('Task Feed', () => {
    test.beforeEach(async ({ page }) => {
      // TaskFeed is behind auth, but we can test the component structure
      // In real E2E, we'd login first or mock auth state
      await page.goto('/#/timebank');
    });

    test('shows login page when not authenticated', async ({ page }) => {
      // AuthGate should show login
      await expect(page.getByText('Sign in to your cooperative care account')).toBeVisible();
    });
  });

  test.describe('Mini CII (Public)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/assessments/mini-cii');
    });

    test('Mini CII loads with 3 sliders', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Quick Care Check' })).toBeVisible();
      const sliders = page.locator('input[type="range"]');
      await expect(sliders).toHaveCount(3);
    });

    test('Mini CII shows results after submit', async ({ page }) => {
      await page.getByRole('button', { name: 'See My Results' }).click();

      // Should show result with zone
      await expect(page.getByText(/Zone/)).toBeVisible();
      await expect(page.getByText('Retake Quick Check')).toBeVisible();
    });

    test('Mini CII retake resets to sliders', async ({ page }) => {
      await page.getByRole('button', { name: 'See My Results' }).click();
      await page.getByRole('button', { name: 'Retake Quick Check' }).click();

      // Should be back to slider view
      await expect(page.getByRole('heading', { name: 'Quick Care Check' })).toBeVisible();
      const sliders = page.locator('input[type="range"]');
      await expect(sliders).toHaveCount(3);
    });

    test('slider values affect zone classification', async ({ page }) => {
      // Set all sliders to maximum (10) → score = 30 → Red zone
      const sliders = page.locator('input[type="range"]');

      for (let i = 0; i < 3; i++) {
        await sliders.nth(i).fill('10');
      }

      // Score should be 30/30 → Red zone
      await expect(page.getByText('30/30')).toBeVisible();
      await expect(page.getByText('Red')).toBeVisible();

      // Set all to minimum (1) → score = 3 → Green zone
      for (let i = 0; i < 3; i++) {
        await sliders.nth(i).fill('1');
      }

      await expect(page.getByText('3/30')).toBeVisible();
      await expect(page.getByText('Green')).toBeVisible();
    });
  });

  test.describe('Task Flow UI (component-level)', () => {
    // These test the component rendering. Full lifecycle needs auth mocking.

    test('onboarding flow starts with Mini CII', async ({ page }) => {
      await page.goto('/#/onboarding');
      await expect(page.getByRole('heading', { name: 'Quick Care Check' })).toBeVisible();
    });

    test('messages route shows auth gate', async ({ page }) => {
      await page.goto('/#/messages');
      await expect(page.getByText('Sign in')).toBeVisible();
    });
  });
});
