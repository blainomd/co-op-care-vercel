import { test, expect } from '@playwright/test';

/**
 * Auth smoke tests
 *
 * Demo credentials (noted for reference):
 *   Email:    sarah@demo.co-op.care
 *   Password: password123
 */

test.describe('Auth', () => {
  test('login page shows email and password fields when navigating to /#/conductor', async ({
    page,
  }) => {
    // /#/conductor is behind AuthGate, which renders LoginPage when not authenticated
    await page.goto('/#/conductor');

    // The login page should display the CareOS heading
    await expect(page.getByRole('heading', { name: 'CareOS' })).toBeVisible();

    // Should show the sign-in subtitle
    await expect(
      page.getByText('Sign in to your cooperative care account'),
    ).toBeVisible();

    // Email field should be present
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Password field should be present
    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Sign In button should be present
    await expect(
      page.getByRole('button', { name: 'Sign In' }),
    ).toBeVisible();

    // Utility links should be available
    await expect(page.getByText('Forgot password?')).toBeVisible();
    await expect(page.getByText('Create account')).toBeVisible();
  });

  test('demo credentials are accepted by the login form fields', async ({ page }) => {
    // Navigate to a protected route to trigger the login page
    await page.goto('/#/conductor');

    // Fill in the demo credentials
    // Email: sarah@demo.co-op.care  Password: password123
    await page.getByLabel('Email').fill('sarah@demo.co-op.care');
    await page.getByLabel('Password').fill('password123');

    // Verify the fields accepted the input
    await expect(page.getByLabel('Email')).toHaveValue('sarah@demo.co-op.care');
    await expect(page.getByLabel('Password')).toHaveValue('password123');

    // Sign In button should be enabled and clickable
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeEnabled();
  });
});
