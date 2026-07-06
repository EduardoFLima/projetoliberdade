import { expect, test } from '@playwright/test'

test('servicos page renders all services, hippussuit and contact CTA', async ({
  page,
}) => {
  await page.goto('/servicos')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossos Serviços' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 3, name: 'Equoterapia' }),
  ).toBeVisible()

  // Every service card shows an icon badge
  const iconBadges = page.locator('article [data-icon-tone]')
  await expect(iconBadges.first()).toBeVisible()
  expect(await iconBadges.count()).toBeGreaterThanOrEqual(7)
  await expect(page.locator('article [data-icon="horse-therapy"]')).toBeVisible()

  await expect(
    page.getByRole('heading', {
      level: 3,
      name: 'Reabilitação Neurofuncional',
    }),
  ).toBeVisible()
  const verMais = page.getByRole('button', { name: /Ver mais/ })
  await expect(verMais).toHaveCount(5)

  const reabilitacaoCard = page
    .locator('article')
    .filter({ hasText: 'Reabilitação Neurofuncional' })
  await reabilitacaoCard.getByRole('button', { name: /Ver mais/ }).click()
  await expect(verMais).toHaveCount(4)
  await expect(
    page.getByText(/Como métodos de atendimento utilizamos/),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { level: 2, name: 'Hippussuit' }),
  ).toBeVisible()
  await expect(page.getByRole('img', { name: 'Hippussuit' })).toBeVisible()

  await expect(
    page.getByRole('heading', { level: 2, name: 'Agende uma Avaliação' }),
  ).toBeVisible()
})

test('servicos is reachable from the header nav', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Serviços' }).first().click()
  await expect(page).toHaveURL(/\/servicos$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossos Serviços' }),
  ).toBeVisible()
})
