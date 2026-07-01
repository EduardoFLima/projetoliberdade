import { expect, test } from '@playwright/test'

test('placeholder route loads content through the seam', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('scaffold-heading')).toContainText(
    'Projeto Liberdade',
  )
})
