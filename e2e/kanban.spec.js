import { test, expect } from '@playwright/test'

test.describe('Kanban Board E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should create lists and cards, move cards, and sync offline changes', async ({
    page,
  }) => {
    await page.click('button:has-text("Add List")')
    await page.fill('input[type="text"]', 'Test List')
    await page.press('input[type="text"]', 'Enter')
    await page.waitForTimeout(500)

    await expect(page.locator('text=Test List')).toBeVisible()

    await page.click('button:has-text("Add a card")')
    await page.fill('input[type="text"]', 'Test Card')
    await page.press('input[type="text"]', 'Enter')
    await page.waitForTimeout(500)

    await expect(page.locator('text=Test Card')).toBeVisible()

    const card = page.locator('text=Test Card').first()
    const list = page.locator('text=Test List').first()

    await card.dragTo(list)
    await page.waitForTimeout(500)

    await page.setOfflineMode(true)
    await page.waitForTimeout(100)

    await page.click('button:has-text("Add a card")')
    await page.fill('input[type="text"]', 'Offline Card')
    await page.press('input[type="text"]', 'Enter')
    await page.waitForTimeout(500)

    await expect(page.locator('text=Offline Card')).toBeVisible()

    await page.setOfflineMode(false)
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Offline Card')).toBeVisible()
  })
})

