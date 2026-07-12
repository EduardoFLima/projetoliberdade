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

test('direct access to a service detail route (/servicos/:slug) expands the matching card', async ({
  page,
}) => {
  await page.goto('/servicos/equoterapia')

  // The page should render without 404
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossos Serviços' }),
  ).toBeVisible()

  const equoterapiaCard = page
    .locator('article')
    .filter({ hasText: 'Equoterapia' })

  // It should be expanded automatically, so its "Ver mais" is not visible
  await expect(
    equoterapiaCard.getByRole('button', { name: /Ver mais/ }),
  ).not.toBeVisible()

  // Full text should be visible
  await expect(
    page.getByText(/A Equoterapia é um método terapêutico e educacional/),
  ).toBeVisible()

  // The card should have visual highlight styling (the border-cta class)
  await expect(equoterapiaCard).toHaveClass(/border-cta/)
})

test('clicking Ver mais on a featured service card on homepage navigates to /servicos/:slug and expands it', async ({
  page,
}) => {
  await page.goto('/')

  // On homepage, featured service card has "Ver mais" as a link
  const equoterapiaCardOnHome = page
    .locator('article')
    .filter({ hasText: 'Equoterapia' })

  await equoterapiaCardOnHome.getByRole('link', { name: /Ver mais/ }).click()

  // It should navigate to /servicos/equoterapia
  await expect(page).toHaveURL(/\/servicos\/equoterapia$/)

  const equoterapiaCard = page
    .locator('article')
    .filter({ hasText: 'Equoterapia' })

  // On the services page, it is expanded automatically and highlighted
  await expect(
    equoterapiaCard.getByRole('button', { name: /Ver mais/ }),
  ).not.toBeVisible()

  await expect(
    page.getByText(/A Equoterapia é um método terapêutico e educacional/),
  ).toBeVisible()

  await expect(equoterapiaCard).toHaveClass(/border-cta/)
})
