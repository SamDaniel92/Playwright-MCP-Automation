import { Page, Locator } from '@playwright/test';

export class JetBlueFlightResultsPage {
  readonly page: Page;
  readonly flightCards: Locator;
  readonly priceElements: Locator;
  readonly selectButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flightCards = page.locator('[data-testid="flight-card"]');
    this.priceElements = page.locator('[data-testid="flight-card"] [data-testid="price-amount"]');
    this.selectButtons = page.getByRole('button', { name: /select/i });
  }

  async waitForResults() {
    // Wait for the heading that indicates the results page is loaded
    await this.page.getByRole('heading', { name: /select your departing flight/i }).waitFor({ state: 'visible', timeout: 30000 });
    // Wait for at least one fare button to appear (more robust selector)
    await this.page.locator('button:has-text("See fares")').first().waitFor({ state: 'visible', timeout: 30000 });
  }

  async getCheapestFlightPrice() {
    // Find all visible fare buttons with price text
    const fareButtons = await this.page.locator('button:has-text("See fares")').all();
    const prices: number[] = [];
    for (const btn of fareButtons) {
      const text = await btn.textContent();
      const match = text && text.match(/\$([\d,]+)/);
      if (match) prices.push(parseFloat(match[1].replace(/,/g, '')));
    }
    return Math.min(...prices);
  }

  async selectCheapestFlight() {
    // Find all visible fare buttons with price text
    const fareButtons = await this.page.locator('button:has-text("See fares")').all();
    let minPrice = Infinity;
    let minIndex = 0;
    for (let i = 0; i < fareButtons.length; i++) {
      const text = await fareButtons[i].textContent();
      const match = text && text.match(/\$([\d,]+)/);
      if (match) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < minPrice) {
          minPrice = price;
          minIndex = i;
        }
      }
    }
    // Wait for overlay and try to remove it if present before clicking
    await this.page.evaluate(() => {
      document.querySelectorAll('.truste_overlay, .truste_box_overlay, #truste-consent-button, #truste-consent-required').forEach(el => el.remove());
      document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.title && iframe.title.toLowerCase().includes('cookie')) {
          iframe.remove();
        }
      });
    });
    await fareButtons[minIndex].click();
    return minPrice;
  }
}
