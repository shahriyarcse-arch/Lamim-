// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Setup Wizard & Onboarding Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage BEFORE page scripts load via addInitScript
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/app/index.html');
    await page.waitForTimeout(2500); // Splash screen transition
  });

  test('onboarding validation prevents empty name and succeeds with valid name', async ({ page }) => {
    const nameInput = page.locator('#setup-name');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // 1. Test Empty Name Submission Validation
    const continueBtn1 = page.locator('.btn-next[onclick*="nextStep(1)"]').first();
    await continueBtn1.click();

    const errorMsg = page.locator('#setup-name-err');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toHaveText(/required/i);

    // 2. Enter Valid Name
    await nameInput.fill('Playwright Tester');
    await continueBtn1.click();
    await page.waitForTimeout(500);

    // 3. Step 2: Gender Selection
    const maleCard = page.locator('#setup-gender-male').first();
    await expect(maleCard).toBeVisible();
    await maleCard.click();

    const continueBtn2 = page.locator('.btn-next[onclick*="nextStep(2)"]').first();
    await continueBtn2.click({ force: true });
    await page.waitForTimeout(500);

    // 4. Step 3: Date of Birth Step -> Next
    const continueBtn3 = page.locator('.btn-next[onclick*="nextStep(3)"]').first();
    await continueBtn3.click({ force: true });
    await page.waitForTimeout(500);

    // 5. Step 4: Fill Coordinates & Finish Setup
    await page.fill('#setup-lat', '23.8103');
    await page.fill('#setup-lng', '90.4125');

    const finishBtn = page.locator('#setup-finish-btn').first();
    await expect(finishBtn).toBeVisible();
    await finishBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // 6. Confirm Setup Page is inactive & Home Section is active
    const pageSetup = page.locator('#page-setup');
    await expect(pageSetup).not.toHaveClass(/active/);

    const homeSection = page.locator('#section-home');
    await expect(homeSection).toHaveClass(/active/);
  });
});
