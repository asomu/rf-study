import { expect, test } from '@playwright/test'

test('production dist serves every hash route with built assets', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
  for (const path of ['/#/', '/#/modules/gsm-pvt/learn', '/#/modules/gsm-pvt/lab', '/#/modules/gsm-pvt/challenge', '/#/modules/gsm-pvt/review']) {
    await page.goto(path)
    await expect(page).toHaveTitle('RF Study Lab')
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByText('SIGNAL PATH LOADING…')).toBeHidden()
  }
})
