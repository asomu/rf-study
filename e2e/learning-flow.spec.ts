import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = ['learn', 'lab', 'challenge', 'review']

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
})

test('예측에서 진단과 Review 증거까지 같은 세션에 보존한다', async ({ page }) => {
  await page.goto('/#/modules/gsm-pvt/lab')
  await expect(page.getByRole('heading', { name: /BURST \/ PvT LAB/ })).toBeVisible()

  await page.getByLabel('Turn-on overshoot', { exact: true }).fill('2.8')
  await page.getByRole('button', { name: /PLATEAU/ }).click()
  await page.getByRole('button', { name: /예측을 제출하고 실행/ }).click()
  await expect(page.getByRole('status').filter({ hasText: /예측이 trace의 첫 결과와 일치합니다/ })).toBeVisible()
  await page.getByLabel('첫 결과 region').selectOption('early-settling')
  await page.getByLabel('worst region', { exact: true }).selectOption('early-settling')
  await page.getByRole('button', { name: '판정 기록' }).click()
  await expect(page.getByRole('status').filter({ hasText: /first와 worst region을 정확히/ })).toBeVisible()

  await page.getByRole('button', { name: /예측을 제출하고 실행/ }).click()
  await page.getByLabel('첫 결과 region').selectOption('early-settling')
  await page.getByLabel('worst region', { exact: true }).selectOption('early-settling')
  await page.getByRole('button', { name: '판정 기록' }).click()

  await page.getByRole('link', { name: /03 CHALLENGE/ }).click()
  await page.getByRole('radio', { name: '정상 기준 파형' }).check()
  await page.getByRole('combobox').selectOption({ label: '모든 sample의 margin이 0 dB 이상' })
  await page.getByRole('button', { name: /진단 제출/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'DIAGNOSIS CONFIRMED' })).toBeVisible()

  await page.getByRole('tab', { name: /Too soon/ }).click()
  await page.getByRole('tab', { name: /Quiet bench/ }).click()
  await page.getByRole('radio', { name: '정상 기준 파형' }).check()
  await page.getByRole('combobox').selectOption({ label: '모든 sample의 margin이 0 dB 이상' })
  await page.getByRole('button', { name: /진단 제출/ }).click()

  await page.getByRole('link', { name: /04 REVIEW/ }).click()
  await expect(page.getByRole('heading', { name: 'GSM Burst / PvT 진단 한 장 요약' })).toBeVisible()
  await expect(page.getByLabel('학습 진행 요약')).toContainText('01 / 06')
  await expect(page.locator('.matrix-cell').filter({ hasText: 'DIAGNOSIS' })).toContainText('1 / 1')
  await expect(page.locator('.matrix-cell').filter({ hasText: 'JUDGMENT' })).toContainText('1 / 1')
  await expect(page.getByText('WORST MARGIN').first()).toBeVisible()
  await page.getByRole('checkbox', { name: '90초 설명을 실제로 완료했습니다.' }).check()
  await expect(page.locator('.matrix-cell').filter({ hasText: 'TEACH-BACK' })).toContainText('100%')

  await page.setViewportSize({ width: 1123, height: 794 })
  await page.emulateMedia({ media: 'print' })
  const printBox = await page.locator('#teaching-snapshot').boundingBox()
  expect(printBox).not.toBeNull()
  expect(printBox!.width).toBeLessThanOrEqual(1123)
  expect(printBox!.height).toBeLessThanOrEqual(794)
})

test('Lab 핵심 조작과 Challenge tab을 키보드로 운용한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#/modules/gsm-pvt/lab')
  await expect(page.locator('.chart-frame').first()).toHaveAttribute('data-motion', 'reduced')
  const overshoot = page.getByLabel('Turn-on overshoot', { exact: true })
  await overshoot.focus()
  await overshoot.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
  await overshoot.pressSequentially('2.8')
  await page.getByRole('button', { name: /PLATEAU/ }).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: /예측을 제출하고 실행/ }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText(/예측이 trace의 첫 결과와 일치합니다/)).toBeVisible()

  await page.goto('/#/modules/gsm-pvt/challenge')
  const firstTab = page.getByRole('tab', { name: /Quiet bench/ })
  await firstTab.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: /Too soon/ })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Home')
  await expect(firstTab).toHaveAttribute('aria-selected', 'true')
})

test('핵심 viewport에서 페이지 수준 가로 넘침이 없다', async ({ page }) => {
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#/modules/gsm-pvt/lab')
    await expect(page.getByRole('heading', { name: /BURST \/ PvT LAB/ })).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }))
    expect(dimensions.page, `${width}px에서 문서가 viewport를 넘지 않아야 합니다`).toBeLessThanOrEqual(dimensions.viewport)
  }

  await page.setViewportSize({ width: 375, height: 812 })
  for (const route of routes) {
    await page.goto(`/#/modules/gsm-pvt/${route}`)
    await expect(page.locator('#main-content')).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, `${route} 모바일 화면의 페이지 가로 넘침`).toBeLessThanOrEqual(0)
  }
})

test('각 학습 화면에 serious 또는 critical 접근성 위반이 없다', async ({ page }) => {
  for (const route of routes) {
    await page.goto(`/#/modules/gsm-pvt/${route}`)
    await expect(page.locator('#main-content')).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    const major = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
    expect(major, `${route}: ${major.map((item) => item.id).join(', ')}`).toEqual([])
  }
})
