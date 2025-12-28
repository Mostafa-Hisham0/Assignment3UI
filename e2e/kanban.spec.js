import { test, expect } from '@playwright/test'

test.describe('Kanban Board E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should create lists and cards, move cards, and sync offline changes', async ({
    page,
  }) => {
    // Handle prompt dialog for adding list
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt')
      await dialog.accept('Test List')
    })

    await page.click('button:has-text("Add List")')
    await page.waitForTimeout(1000)

    // Wait for the list to appear
    await expect(page.locator('text=Test List')).toBeVisible({ timeout: 5000 })

    // Find the first list column and add a card
    const listColumn = page.locator('[role="main"]').first()
    const addCardButton = listColumn.locator('button:has-text("Add a card")').first()
    
    // Click to show the InlineEditor (not a prompt dialog)
    await addCardButton.click()
    
    // Wait for the input to appear and fill it
    // Use input element with placeholder or aria-label
    const cardInput = page.locator('input[placeholder*="card title"], input[aria-label="Edit text"]').first()
    await expect(cardInput).toBeVisible({ timeout: 5000 })
    await cardInput.fill('Test Card')
    await cardInput.press('Enter')
    await page.waitForTimeout(500)

    // Wait for the card to appear
    await expect(page.locator('text=Test Card')).toBeVisible({ timeout: 5000 })

    // Test drag and drop - find card and list elements
    const card = page.locator('text=Test Card').first()
    const list = page.locator('text=Test List').first().locator('..')

    // Perform drag and drop
    await card.dragTo(list)
    await page.waitForTimeout(1000)

    // Test offline functionality
    await page.context().setOffline(true)
    await page.waitForTimeout(100)

    // Add card while offline (using InlineEditor, not prompt)
    await addCardButton.click()
    const offlineCardInput = page.locator('input[placeholder*="card title"], input[aria-label="Edit text"]').first()
    await expect(offlineCardInput).toBeVisible({ timeout: 5000 })
    await offlineCardInput.fill('Offline Card')
    await offlineCardInput.press('Enter')
    await page.waitForTimeout(500)

    await expect(page.locator('text=Offline Card')).toBeVisible({ timeout: 5000 })

    // Go back online
    await page.context().setOffline(false)
    await page.waitForTimeout(2000)

    // Verify offline card still exists after sync
    await expect(page.locator('text=Offline Card')).toBeVisible({ timeout: 5000 })
  })
})

