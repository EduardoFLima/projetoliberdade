import { expect, test } from '@playwright/test'

test('homepage renders hero and all sections', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reabilitação e Equoterapia' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'História' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Missão, Visão e Valores' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
  ).toBeVisible()
})

test('hero and service CTAs point to their routes', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('link', { name: 'Nossos Serviços' }),
  ).toHaveAttribute('href', '/servicos')
  await expect(
    page.getByRole('link', { name: 'Entre em Contato' }).first(),
  ).toHaveAttribute('href', '/contato')
  await expect(
    page.getByRole('link', { name: /Ver mais/ }).first(),
  ).toHaveAttribute('href', '/servicos/equoterapia')
})
