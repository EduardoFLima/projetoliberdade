import { expect, test } from '@playwright/test'

test('historia page renders hero, narrative and MVV', async ({ page }) => {
  await page.goto('/historia')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossa História' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', {
      name: /André Amaral e Karina Hollatz/,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Missão, Visão e Valores' }),
  ).toBeVisible()
})

test('historia is reachable from the header nav', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'História' }).first().click()
  await expect(page).toHaveURL(/\/historia$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossa História' }),
  ).toBeVisible()
})
