import { expect, test } from '@playwright/test'

test('production dist serves every hash route with built assets', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
  for (const route of ['learn', 'lab', 'challenge', 'review']) {
    await page.goto(`/#/modules/gsm-pvt/${route}`)
    await expect(page).toHaveTitle('RF Study Lab — GSM Burst / PvT')
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByText('SIGNAL PATH LOADING…')).toBeHidden()
  }
})
