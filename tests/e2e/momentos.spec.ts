import { expect, test } from '@playwright/test'

test('momentos videos page renders header, toggle and two video cards', async ({
  page,
}) => {
  await page.goto('/momentos')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossos Momentos' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Vídeos' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fotos' })).toBeDisabled()
  await expect(page.getByRole('button', { name: /^Assistir:/ })).toHaveCount(2)
})

test('playing a video opens the modal', async ({ page }) => {
  await page.goto('/momentos')
  await page
    .getByRole('button', { name: 'Assistir: O menino e seu cavalo' })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('momentos is reachable from the header nav by clicking the main button', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('site-header').getByRole('link', { name: 'Momentos', exact: true }).click()
  await expect(page).toHaveURL(/\/momentos/)
  await expect(page.getByRole('heading', { level: 1, name: 'Nossos Momentos' })).toBeVisible()
})

test('momentos submenu is accessible via hover', async ({ page }) => {
  await page.goto('/')
  // Hover over the main button
  await page.getByTestId('site-header').getByRole('link', { name: 'Momentos', exact: true }).hover()

  // Verify submenu becomes visible
  const submenuLink = page.getByRole('link', { name: 'Vídeos' })
  await expect(submenuLink).toBeVisible()

  // Try to click the submenu link
  await submenuLink.click()
  await expect(page).toHaveURL(/\/momentos\/videos/)
})
