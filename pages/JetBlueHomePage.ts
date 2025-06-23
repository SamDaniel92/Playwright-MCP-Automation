import { Page, Locator } from '@playwright/test';
import { testData } from '../helpers/testData';

export class JetBlueHomePage {
  readonly page: Page;
  readonly Triptype: Locator;
  readonly oneWayButton: Locator;
  readonly fromInput: Locator;
  readonly toInput: Locator;
  readonly airportOptions: Locator;
  readonly departDateInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // The 'One-way' button is a span, not a button. Use a more robust locator.
    // Accept cookies overlay can block clicks, so handle it if present
    this.Triptype = page.locator('//div[normalize-space(text())="Roundtrip"]');
    this.oneWayButton = page.locator('span', { hasText: 'One-way' });
    this.fromInput = page.getByRole('combobox', { name: /from/i });
    this.toInput = page.getByRole('combobox', { name: /to/i });
    this.airportOptions = page.locator('[data-testid="airport-option"]');
    this.departDateInput = page.getByRole('textbox', { name: /depart/i });
    this.searchButton = page.getByRole('button', { name: /search flights/i });
  }

  async goto() {
    await this.page.goto('https://www.jetblue.com/');
    // Wait for overlay and try to remove it if present
    await this.page.waitForTimeout(2000);
    // Remove TrustArc overlays and iframes
    await this.page.evaluate(() => {
      document.querySelectorAll('.truste_overlay, .truste_box_overlay, #truste-consent-button, #truste-consent-required').forEach(el => el.remove());
      document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.title && iframe.title.toLowerCase().includes('cookie')) {
          iframe.remove();
        }
      });
    });
  }

   async selectTriptypeicon() {
    await this.Triptype.click();
  }

  async selectOneWay() {
    await this.oneWayButton.click();
  }

  async selectFromAirport() {
    await this.fromInput.click();
    await this.fromInput.fill('');
    await this.fromInput.type(testData.from.code, { delay: 100 });
    await this.page.waitForTimeout(500);
    await this.page.getByText(testData.from.full, { exact: true }).click();
  }

  async selectToAirport() {
    await this.toInput.click();
    // Clear any pre-filled value
    await this.toInput.fill('');
    await this.toInput.type(testData.to.code, { delay: 100 });
    await this.page.waitForTimeout(500);
    await this.page.getByText(testData.to.full, { exact: true }).click();
  }

  async selectRandomFutureDate() {
    const min = testData.minDaysInFuture;
    const max = testData.maxDaysInFuture;
    const daysToAdd = Math.floor(Math.random() * (max - min + 1)) + min;
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const formatted = `${mm}/${dd}/${yyyy}`;
    await this.departDateInput.click();
    await this.departDateInput.fill(formatted);
    await this.page.keyboard.press('Enter');
  }

  async searchFlights() {
    await this.searchButton.click();
  }
}
