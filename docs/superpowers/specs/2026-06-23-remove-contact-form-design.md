# Remove Contact Form from Contato Section — Design

Date: 2026-06-23

## Problem

The Contato section renders a `ContactForm` that does not send email. On a
valid submit it only flips local React state to show a "Mensagem enviada com
sucesso!" message; there is no network request, email service, or backend. This
misleads visitors into thinking they contacted the organization. The form should
be removed.

Removing the form empties the bottom of the left grid column, leaving the
two-column layout (contact info on the left, units on the right) visually
unbalanced. The fallback data already contains a `social` block (Facebook +
Instagram) that the component never renders, which can fill the gap.

## Goals

- Remove the non-functional contact form entirely.
- Keep the existing two-column layout balanced.
- Surface the Facebook and Instagram links that already exist in the data.

## Non-Goals

- Wiring up a real email/contact mechanism.
- Redesigning the units column or the overall section layout.
- Changing any data files.

## Scope of Changes

All changes are in `src/components/Contato.jsx`, plus two image assets added to
`public/contato/`.

### 1. Remove the contact form

- Delete the entire `function ContactForm()` definition.
- Delete the "Envie uma mensagem" wrapper card that renders `<ContactForm />`.
- Remove the now-unused `import { useState } from 'react'` (only `ContactForm`
  used it; `UnitCard` and `Contato` do not).

### 2. Add social-media icon assets

Download from the project's original repository into `public/contato/`:

- `facebook-512.png`
- `instas-app-icon2.png`

Source:
`https://raw.githubusercontent.com/EduardoFLima/projetoliberdade/master/src/resources/images/contato/<file>`

These filenames match the existing data values
(`social.fb.img.src` = `"contato/facebook-512.png"`,
`social.insta.img.src` = `"contato/instas-app-icon2.png"`), so they resolve as
`/contato/<file>` from the public root. WhatsApp keeps the existing 📱 emoji;
`whatsapp-256.png` is not needed.

### 3. Add a "Redes Sociais" block

In the left column, below the e-mail block, render a social section from
`data.social`:

- Heading: `social.subtitulo` (fallback `"Redes Sociais"`).
- One link per network (Facebook, Instagram), each:
  - `href` = `social.<net>.url`, `target="_blank"`, `rel="noopener noreferrer"`.
  - Hover-card styling consistent with the existing WhatsApp links.
  - `<img>` icon (~`w-8 h-8`) with a meaningful `alt` (e.g. "Facebook").
- Guard with optional chaining so a missing `social` (or missing network)
  renders nothing and never throws.

## Resulting Layout

Two-column grid unchanged:

- **Left:** Telefone/WhatsApp → E-mail → Redes Sociais
- **Right:** Nossas Unidades (unit cards)

## Error Handling

- `Contato` already returns `null` when `data` is absent.
- All new data access uses optional chaining; absent `social` or network entries
  simply render nothing.

## Verification

- `npm run build` completes with no errors (confirms no dangling references to
  `ContactForm` / `useState`).
- Manual check: the section shows phone, e-mail, and Facebook/Instagram links on
  the left, units on the right, and no form.
