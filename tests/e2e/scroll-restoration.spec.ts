import { expect, test } from '@playwright/test'

test('navigating to a new page scrolls back to the top', async ({ page }) => {
  await page.goto('/')

  // Wait for the async content to render so the page is tall enough to scroll.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reabilitação e Equoterapia' }),
  ).toBeVisible()

  // Scroll to the bottom of the home page.
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  )
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  // Navigate to another page via the nav.
  await page.getByRole('link', { name: 'História' }).first().click()
  await expect(page).toHaveURL(/\/historia$/)

  // The new page must open from the top.
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})
