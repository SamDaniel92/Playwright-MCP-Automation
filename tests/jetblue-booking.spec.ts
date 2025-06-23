import { test, expect } from '@playwright/test';
import { JetBlueHomePage } from '../pages/JetBlueHomePage';
import { JetBlueFlightResultsPage } from '../pages/JetBlueFlightResultsPage';
import { testData } from '../helpers/testData';

// @smoke @regression @jetblue
// Test: Book a one-way flight ATL -> LHR on a random future date
// This test is independent, reliable, and uses the Page Object Model

test.describe('JetBlue One-way Flight Booking', () => {
  test('should book a one-way flight ATL to LHR on a random future date', async ({ page }) => {
    const home = new JetBlueHomePage(page);
    const results = new JetBlueFlightResultsPage(page);

    // 1. Navigate to the flight search page
    await home.goto();

    // 2. Accept Cookies (if any)
    if (await page.getByRole('dialog', { name: /cookies/i }).isVisible().catch(() => false)) {
      const acceptBtn = page.getByRole('button', { name: /accept/i });
      if (await acceptBtn.isVisible().catch(() => false)) {
        await acceptBtn.click();
      }
    }

    // 3. Select trip type as Oneway (ensure trip type icon is clicked first)
    await home.selectTriptypeicon();
    await home.selectOneWay();
    // 4. Select 'ATL' as the departure airport
    await home.selectFromAirport();
    // 5. Select 'LHR' as the arrival airport
    await home.selectToAirport();
    // 6. Select a random date at least 10 days in the future
    await home.selectRandomFutureDate();
    // 7. Click the search button
    await home.searchFlights();

    // 8. Wait for the list of available flights
    await results.waitForResults();
    // 9. Print the cheapest flight price
    const cheapest = await results.getCheapestFlightPrice();
    console.log(`Cheapest flight price: $${cheapest}`);
    // 10. Select any one flight from the results
    await results.selectCheapestFlight();
    expect(cheapest).toBeGreaterThan(0);
  });
});
