// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Landing Page Interactive Widgets Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('01 - Hijri Chip renders and displays live Hijri date', async ({ page }) => {
    const hijriChip = page.locator('#landing-hijri-chip');
    await expect(hijriChip).toBeVisible();
    const hijriText = page.locator('#landing-hijri-text');
    await expect(hijriText).toBeVisible();
    await expect(hijriText).not.toHaveText('Loading…');
    await expect(hijriText).toContainText('AH');
  });

  test('02 - Dhikr Tasbeeh counter increments on click and displays tap label', async ({ page }) => {
    const dhikrSection = page.locator('#feature-dhikr');
    await dhikrSection.scrollIntoViewIfNeeded();
    const ring = page.locator('#landing-dhikr-ring');
    await expect(ring).toBeVisible();

    const countEl = page.locator('#landing-dhikr-count');
    await expect(countEl).toHaveText('108');

    await ring.click();
    await expect(countEl).toHaveText('109');

    await ring.click();
    await expect(countEl).toHaveText('110');

    const labelEl = page.locator('#landing-dhikr-label');
    await expect(labelEl).toBeVisible();
  });

  test('03 - Habits 4-7-8 breathing circle starts cycle on click', async ({ page }) => {
    const HabitsSection = page.locator('#feature-habits');
    await HabitsSection.scrollIntoViewIfNeeded();
    const circle = page.locator('#landing-breath-circle');
    await expect(circle).toBeVisible();

    const stateEl = page.locator('#landing-breath-state');
    const subEl = page.locator('#landing-breath-sub');
    const countEl = page.locator('#landing-breath-count');

    await expect(subEl).toBeVisible();
    await expect(subEl).toHaveText('start guide');

    // Click to start breathing guide (force: true bypasses Playwright element stability check during continuous CSS keyframe pulse)
    await circle.click({ force: true });
    await expect(countEl).toBeVisible();
    await expect(stateEl).toHaveText('Breathe In');
  });

  test('04 - Gym Water Glass Tumbler adds 250ml water on click', async ({ page }) => {
    const gymSection = page.locator('#feature-gym');
    await gymSection.scrollIntoViewIfNeeded();
    const glass = page.locator('#landing-water-glass');
    await expect(glass).toBeVisible();

    const amountEl = page.locator('#landing-water-amount');
    const pctEl = page.locator('#landing-water-pct');

    await expect(amountEl).toHaveText('750');
    await expect(pctEl).toContainText('25%');

    // Click glass to add water
    await glass.click();
    await expect(amountEl).toHaveText('1000');
    await expect(pctEl).toContainText('33%');
  });

  test('05 - Career focus card and streak pill render on landing page', async ({ page }) => {
    const careerCard = page.locator('#landing-career-card');
    await careerCard.scrollIntoViewIfNeeded();
    await expect(careerCard).toBeVisible();

    const streakBadge = page.locator('#landing-career-streak');
    await expect(streakBadge).toBeVisible();
  });

  test('06 - Text selection is prevented on interactive cards and buttons', async ({ page }) => {
    const dhikrRing = page.locator('#landing-dhikr-ring');
    const userSelect = await dhikrRing.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.userSelect || style.webkitUserSelect || style.getPropertyValue('-webkit-user-select');
    });
    expect(userSelect).toBe('none');
  });
});
