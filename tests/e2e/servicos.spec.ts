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

test('clicking Ver mais on /servicos selects the card: path changes and the card expands highlighted', async ({
  page,
}) => {
  await page.goto('/servicos')

  const verMais = page.getByRole('link', { name: /Ver mais/ })
  await expect(verMais).toHaveCount(5)

  const reabilitacaoCard = page
    .locator('article')
    .filter({ hasText: 'Reabilitação Neurofuncional' })
  await reabilitacaoCard.getByRole('link', { name: /Ver mais/ }).click()

  // Same page, new path
  await expect(page).toHaveURL(/\/servicos\/reabilitacao-neurofuncional$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossos Serviços' }),
  ).toBeVisible()

  // Card is expanded (full text visible, its Ver mais is gone) and highlighted
  await expect(verMais).toHaveCount(4)
  await expect(
    page.getByText(/Como métodos de atendimento utilizamos/),
  ).toBeVisible()
  await expect(reabilitacaoCard).toHaveClass(/border-cta/)
})

test('clicking a card body on /servicos highlights it and updates the path', async ({
  page,
}) => {
  await page.goto('/servicos')

  const equoterapiaCard = page
    .locator('article')
    .filter({ hasText: 'Equoterapia' })
  await equoterapiaCard.getByRole('heading', { level: 3 }).click()

  await expect(page).toHaveURL(/\/servicos\/equoterapia$/)
  await expect(equoterapiaCard).toHaveClass(/border-cta/)

  // Selecting another card moves the highlight
  const petCard = page.locator('article').filter({ hasText: 'Pet Terapia' })
  await petCard.getByRole('heading', { level: 3 }).click()

  await expect(page).toHaveURL(/\/servicos\/pet-terapia$/)
  await expect(petCard).toHaveClass(/border-cta/)
  await expect(equoterapiaCard).not.toHaveClass(/border-cta/)
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
    equoterapiaCard.getByRole('link', { name: /Ver mais/ }),
  ).not.toBeVisible()

  // Full text should be visible
  await expect(
    page.getByText(/A Equoterapia é um método terapêutico e educacional/),
  ).toBeVisible()

  // The card should have visual highlight styling (the border-cta class)
  await expect(equoterapiaCard).toHaveClass(/border-cta/)
})

test('/servicos/hippussuit highlights the Hippussuit section and scrolls to it', async ({
  page,
}) => {
  await page.goto('/servicos/hippussuit')

  const hippussuitHeading = page.getByRole('heading', {
    level: 2,
    name: 'Hippussuit',
  })
  await expect(hippussuitHeading).toBeInViewport()

  const panel = page
    .locator('div.border-cta')
    .filter({ has: hippussuitHeading })
  await expect(panel).toBeVisible()

  // No service card is highlighted
  await expect(page.locator('article.border-cta')).toHaveCount(0)
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
    equoterapiaCard.getByRole('link', { name: /Ver mais/ }),
  ).not.toBeVisible()

  await expect(
    page.getByText(/A Equoterapia é um método terapêutico e educacional/),
  ).toBeVisible()

  await expect(equoterapiaCard).toHaveClass(/border-cta/)
})
