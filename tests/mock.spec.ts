import { test, expect } from '@playwright/test';

test('Mock API Response', async ({ page }) => {

    // Intercept API request
    await page.route('**/users/1', async (route) => {

        await route.fulfill({

            status: 200,

            contentType: 'application/json',

            body: JSON.stringify({

                id: 1,
                name: 'Om',
                role: 'QA Automation Lead'

            })

        });

    });

    await page.goto('https://myapp.com/profile');

    await expect(page.locator('#userName'))
        .toHaveText('Om');

});