import { test, expect } from '@playwright/test';

test.describe('Onboarding', () => {
  test('onboarding page loads at /#/onboarding', async ({ page }) => {
    await page.goto('/#/onboarding');

    // The onboarding flow should render the Quick Check step (Mini CII)
    await expect(page.getByText('Quick Check')).toBeVisible();
  });

  test('family onboarding wizard loads at /#/onboarding/family', async ({ page }) => {
    await page.goto('/#/onboarding/family');

    // Family onboarding should show the Welcome step
    await expect(page.getByText('Welcome', { exact: false })).toBeVisible();

    // Step labels should be present in the wizard
    const stepLabels = ['Welcome', 'Profile', 'Assessment', 'Membership', 'Care Team'];
    for (const label of stepLabels) {
      await expect(page.getByText(label, { exact: true }).first()).toBeAttached();
    }
  });

  test('federation waitlist loads at /#/federation', async ({ page }) => {
    await page.goto('/#/federation');

    // Federation page heading
    await expect(
      page.getByText('Bring co.op.care to Your City', { exact: false }),
    ).toBeVisible();

    // Waitlist form should be present
    await expect(page.getByText('Join the Waitlist').first()).toBeVisible();
  });
});
