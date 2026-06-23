# Projeto Liberdade Website Implementation Plan

This plan details the step-by-step implementation of a responsive, accessibility-compliant brochure website for **Projeto Liberdade**, a company providing equotherapy for children with special needs.

The implementation is structured around **Vite**, **React**, and **Tailwind CSS v4**, using the official text content from their Firebase Realtime Database with a robust local fallback system and full WAI-ARIA accessibility mapping.

## User Review Required

> [!IMPORTANT]
> The styling dimensions defined in the original database JSON (such as image widths/heights) will be ignored to ensure responsive rendering across all mobile, tablet, and desktop devices via Tailwind classes.

## Proposed Changes

We will scaffold a clean Vite + React app, install Tailwind CSS v4 and Vitest, and implement the pages and components.

### Setup and Scaffolding
* Scaffold Vite React app in root directory.
* Configure Tailwind CSS v4 `@theme` inside [index.css](file:///Users/eduardolima/projects/projetoliberdade/src/index.css) to act as central Design Tokens repository.
* Download and save the official Logo image from the Github repository.
* Place the local JSON data inside [websiteFallback.json](file:///Users/eduardolima/projects/projetoliberdade/src/data/websiteFallback.json).

### Core Utilities and Testing
* Write unit tests for the data loading utility using **Vitest**.
* Implement [fetchData.js](file:///Users/eduardolima/projects/projetoliberdade/src/utils/fetchData.js) which fetches from Firebase with a fallback to the local JSON on network failure.

### Accessible Components (WAI-ARIA)
* **Header/Navbar**: Sticky glassmorphic navbar with responsive mobile menu using `aria-expanded` and `aria-haspopup`.
* **Hero**: Emotionally engaging landing section with carousel background, company title, logo, and action CTAs.
* **History**: Two-column responsive section showing paragraphs of history text.
* **Mission/Vision/Valores**: Interactive accessible tab panel.
* **Services**: Grid of service cards that can be expanded to show full descriptions on click.
* **Hippussuit**: Deep dive section showing the benefits of the postural vest.
* **Gallery (Mídia)**: Interactive tab layout separating Photo Albums and Videos, opening into a fully accessible focus-locked **Lightbox Modal**.
* **Contact & Units**: Unit address cards with map links, quick phone/WhatsApp triggers, and a message form with validation.

## Verification Plan

### Automated Tests
* Run `npx vitest run` to execute unit tests.
* Run `npm run build` to verify production compilation and bundling.

### Manual Verification
* Deploy locally and run dev server using `npm run dev`.
* Verify WAI-ARIA keyboard navigation (modal focus trap, Escape key closing, next/prev arrow key slides).
* Verify responsive viewports (mobile, tablet, desktop).
