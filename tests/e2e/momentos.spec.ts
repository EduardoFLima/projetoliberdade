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
