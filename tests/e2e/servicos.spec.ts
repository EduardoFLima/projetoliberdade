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
  await expect(
    page.getByRole('heading', {
      level: 3,
      name: 'Reabilitação Neurofuncional',
    }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Ver mais/ })).toHaveCount(7)

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
