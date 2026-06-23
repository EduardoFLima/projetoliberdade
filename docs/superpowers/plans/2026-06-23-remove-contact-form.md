# Remove Contact Form from Contato Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the non-functional contact form from the Contato section and replace the freed space with Facebook/Instagram links sourced from existing data.

**Architecture:** A single presentational React component (`Contato.jsx`) is edited: delete the `ContactForm` component and its usage, drop the now-unused `useState` import, and add a "Redes Sociais" block driven by `data.social`. Two icon PNGs are added under `public/contato/` so the data's `img.src` values resolve from the public root. A Vitest + React Testing Library component test locks the behavior.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 4, Vitest 4, @testing-library/react.

## Global Constraints

- Test runner: `npx vitest run` (no `test` npm script exists; vitest config lives in `vite.config.js` with jsdom + `src/test/setup.js`).
- Build check: `npm run build` (`vite build`).
- All new data access uses optional chaining; absent `social` or a missing network renders nothing and must not throw.
- Do not modify `src/data/websiteFallback.json` or any other component.
- Icon source: `https://raw.githubusercontent.com/EduardoFLima/projetoliberdade/master/src/resources/images/contato/<file>`.

---

### Task 1: Remove form, add social block, add icons

**Files:**
- Modify: `src/components/Contato.jsx`
- Create: `src/components/Contato.test.jsx`
- Create (binary, downloaded): `public/contato/facebook-512.png`, `public/contato/instas-app-icon2.png`

**Interfaces:**
- Consumes: `Contato({ data })` where `data` has `titulo`, `telefone.contatos`, `email`, `enderecos`, and `social` with shape `{ subtitulo, fb: { url, img: { src } }, insta: { url, img: { src } } }`.
- Produces: a `Contato` default export with no form and accessible Facebook/Instagram links named by `alt` text.

- [ ] **Step 1: Write the failing test**

Create `src/components/Contato.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import Contato from './Contato'

const data = {
  titulo: 'Contato',
  telefone: {
    subtitulo: 'Telefone/Whatsapp',
    contatos: { c1: { nome: 'Karina', numero: '(11) 94191-7707' } },
  },
  email: { subtitulo: 'e-mail', endereco: 'contato@projetoliberdade.com.br' },
  social: {
    subtitulo: 'Redes sociais',
    fb: {
      url: 'http://www.facebook.com.br/projetoliberdade',
      img: { src: 'contato/facebook-512.png' },
    },
    insta: {
      url: 'https://www.instagram.com/projetoliberdadereabilitacao',
      img: { src: 'contato/instas-app-icon2.png' },
    },
  },
  enderecos: [
    {
      nome: 'Haras Liberdade - Serra',
      subtitulo: 'Unidade 1 - Serra',
      localidade: 'R. Flôr da Penha, 916',
      bairro: 'Bela Vista',
      cidade: 'Mairiporã',
      uf: 'SP',
      cep: '07612-852',
    },
  ],
}

test('does not render the contact form', () => {
  render(<Contato data={data} />)
  expect(screen.queryByRole('button', { name: /enviar mensagem/i })).toBeNull()
  expect(screen.queryByLabelText(/mensagem/i)).toBeNull()
})

test('renders facebook and instagram links from data', () => {
  render(<Contato data={data} />)
  expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute(
    'href',
    'http://www.facebook.com.br/projetoliberdade'
  )
  expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
    'href',
    'https://www.instagram.com/projetoliberdadereabilitacao'
  )
})

test('renders without throwing when social data is absent', () => {
  const { social, ...withoutSocial } = data
  render(<Contato data={withoutSocial} />)
  expect(screen.queryByRole('link', { name: /facebook/i })).toBeNull()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/Contato.test.jsx`
Expected: FAIL — the "facebook"/"instagram" link queries find nothing (social block not yet rendered), and the form-button test may still pass.

- [ ] **Step 3: Remove the `useState` import**

In `src/components/Contato.jsx`, delete the first line:

```jsx
import { useState } from 'react'
```

(The file should now start directly with `function UnitCard({ unit }) {`.)

- [ ] **Step 4: Delete the `ContactForm` component**

Remove the entire `function ContactForm() { ... }` definition (everything from `function ContactForm() {` through its closing `}` that precedes `export default function Contato`).

- [ ] **Step 5: Destructure `social` and replace the form card with a social block**

In `Contato`, change the destructure line:

```jsx
  const { telefone, email, enderecos, social } = data
```

Replace the "Contact form" card:

```jsx
          {/* Contact form */}
          <div className="bg-neutral-50 rounded-[var(--radius-card)] p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Envie uma mensagem</h3>
            <ContactForm />
          </div>
```

with the social block:

```jsx
          {/* Social media */}
          {social && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {social.subtitulo || 'Redes Sociais'}
              </h3>
              <div className="space-y-3">
                {social.fb?.url && (
                  <a
                    href={social.fb.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors no-underline"
                  >
                    <img src={`/${social.fb.img?.src}`} alt="Facebook" className="w-8 h-8" />
                    <span className="font-medium text-neutral-800">Facebook</span>
                  </a>
                )}
                {social.insta?.url && (
                  <a
                    href={social.insta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors no-underline"
                  >
                    <img src={`/${social.insta.img?.src}`} alt="Instagram" className="w-8 h-8" />
                    <span className="font-medium text-neutral-800">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}
```

- [ ] **Step 6: Download the icon assets**

Run:

```bash
mkdir -p public/contato
curl -L -o public/contato/facebook-512.png https://raw.githubusercontent.com/EduardoFLima/projetoliberdade/master/src/resources/images/contato/facebook-512.png
curl -L -o public/contato/instas-app-icon2.png https://raw.githubusercontent.com/EduardoFLima/projetoliberdade/master/src/resources/images/contato/instas-app-icon2.png
```

Expected: both files exist and are non-empty PNGs (verify with `file public/contato/*.png` → "PNG image data").

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/components/Contato.test.jsx`
Expected: PASS (all three tests green).

- [ ] **Step 8: Run the build to verify no dangling references**

Run: `npm run build`
Expected: build completes with no errors (no references to `ContactForm` or `useState`).

- [ ] **Step 9: Commit**

```bash
git add src/components/Contato.jsx src/components/Contato.test.jsx public/contato/facebook-512.png public/contato/instas-app-icon2.png
git commit -m "feat: remove non-functional contact form, add social links"
```

---

## Self-Review

**Spec coverage:**
- Remove form + usage + `useState` import → Steps 3–5. ✓
- Add icon assets under `public/contato/` → Step 6. ✓
- Add "Redes Sociais" block from `data.social` with guarded rendering → Step 5. ✓
- Layout (Telefone → E-mail → Redes Sociais on left, units on right) → preserved by inserting the social block where the form card was. ✓
- Verification via `npm run build` + manual/automated check → Steps 7–8, plus component test. ✓

**Placeholder scan:** No TBD/TODO; all code blocks are complete. ✓

**Type consistency:** Test and implementation both use `social.fb.url`, `social.insta.url`, `social.fb.img.src`, `social.insta.img.src`, and `social.subtitulo`, matching the fallback-data shape. ✓
