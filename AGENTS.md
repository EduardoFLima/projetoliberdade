# AGENTS.md — AI Agent Guidelines & Superpowers integration

Welcome! This file provides essential guidelines, context, and requirements for AI coding agents (such as Google Jules, Claude Code, Cursor, Gemini, and Codex) working on the **Projeto Liberdade** repository.

> [!IMPORTANT]
> This repository strictly follows the **Superpowers** agentic software development methodology. You are required to follow it for every task you perform.

---

## 1. Project Context & Purpose

Brochure website for **Projeto Liberdade** (Brazilian equine-therapy / rehabilitation organization). Content-driven: today from a bundled `content.json` snapshot; later from Firebase Realtime Database (RTDB) at runtime with the JSON as fallback.

### Content conventions

Content model is locked in `docs/superpowers/specs/2026-06-30-content-json-redesign-design.md`:

- English keys, Portuguese content values, slugs double as URL paths (e.g., `/servicos/equoterapia`).
- `body` is an ordered array of typed blocks (discriminator `type`).
- 5 pages: home, historia, servicos, momentos, contato.

---

## 2. Superpowers Methodology Integration

All agent skills are checked into the repository under the [.superpowers/skills/](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills) folder. You **MUST** read and invoke the appropriate skills before taking actions or responding:

1. **Bootstrap & Core Rule**: Read and follow [.superpowers/skills/using-superpowers/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/using-superpowers/SKILL.md) before any action—including clarifying questions, planning, or editing files.
   - _Rule:_ Check for relevant skills before every task. This is a mandatory workflow.
2. **Brainstorming & Requirements**: Run [.superpowers/skills/brainstorming/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/brainstorming/SKILL.md) before starting any implementation. Explore the user's intent, verify design choices, and align on requirements.
3. **Implementation Planning**: Run [.superpowers/skills/writing-plans/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/writing-plans/SKILL.md) to build a step-by-step plan specifying exact file paths and verification commands.
4. **Test-Driven Development (TDD)**: Enforce the RED-GREEN-REFACTOR cycle using [.superpowers/skills/test-driven-development/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/test-driven-development/SKILL.md). You MUST write failing tests first, verify they fail, write minimal code to make them pass, and refactor.
5. **Systematic Debugging**: If you encounter a bug or test failure, use [.superpowers/skills/systematic-debugging/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/systematic-debugging/SKILL.md) to trace the root cause systematically.
6. **Task & Fix Verification**: Before declaring any task complete, you MUST use [.superpowers/skills/verification-before-completion/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/verification-before-completion/SKILL.md) and run all project verification commands (linting, tests, builds).
7. **Task Tracking**: Maintain a task artifact (markdown checklist) at the start of any multi-step task, updating it as you progress. Do not use `manage_task` (which is for background processes) for task tracking.

---

## 3. Tech Stack

- **Frontend Core**: TypeScript 6 (strict), React 19, Vite 8
- **Routing**: React Router v8 (library/data mode: `createBrowserRouter` + `RouterProvider`)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` + `@import "tailwindcss"` in `src/index.css` (no `tailwind.config.js` or PostCSS)
- **Unit & Integration Tests**: Vitest + Testing Library
- **E2E Tests**: Playwright
- **Package Manager**: `pnpm`
- **Formatting & Linting**: ESLint flat config + Prettier (no semicolons, single quotes, trailing commas)

---

## 4. Design System ("Organic Freedom")

- Tokens live in `src/index.css` as a Tailwind v4 `@theme` block — the single source of truth. Reference: `docs/design/organic-freedom/DESIGN.md`.
- **Hybrid palette:** The full MD3 color set is imported verbatim; the brand layer adds `--color-cta` (#00aa5a vibrant, CTA fill), `--color-cta-hover` / `--color-cta-strong` / `--color-link` (#006d38 for hover, compact buttons, and small green text).
- **Primary buttons** use `#00aa5a` with a white label at `text-button` (≥18.66px/700) so white-on-green meets WCAG AA (large text, 3:1); compact buttons use `#006d38`.
- **Fonts:** Plus Jakarta Sans + Work Sans, self-hosted via `@fontsource` and imported in `src/main.tsx`.
- **Style Guide:** Components are viewable at the dev route `/estilo`.

---

## 5. Project Structure & Conventions

```
src/
  content/      # THE boundary — data-source isolation
    types.ts                  # domain types
    ContentRepository.ts      # port (interface)
    JsonContentRepository.ts  # adapter — bundled content.json (now)
    content.ts                # binding: selects the active repository
    useContent.ts             # React hook used by the UI
    content.json              # snapshot data
  features/     # page containers and logic
    home/                     # HomePage container + homeSelectors
  components/   # presentational, prop-driven UI
    ui/                       # Button, Chip, Card, Container, Section
    blocks/                   # BlockRenderer + one renderer per Block.type
    sections/                 # reusable, prop-driven page sections (Hero, Historia, MVV, Services)
    Header.tsx Nav.tsx Footer.tsx SocialLinks.tsx Gallery.tsx Lightbox.tsx VideoEmbed.tsx
  styleguide/   # StyleGuide.tsx (dev-only, route /estilo)
  layouts/      # SiteLayout shell
  lib/          # cn() and small utils
  routes.tsx    # router config
  main.tsx      # SPA entry
  index.css     # Tailwind main entry / @import "tailwindcss"
tests/e2e/      # Playwright test specs
```

### The dependency rule (non-negotiable)

- Files under `features`, `components`, and `layouts` **never** import `content.json` or reference Firebase directly.
- The routed layout (`SiteLayout`) or page containers retrieve data using `useContent` and flow it down via the React Router outlet context (`useOutletContext`). Presentational components receive content via props only.
- Container content flows to pages via the router `Outlet` context (`SiteLayout` provides it; page containers read it with `useOutletContext`).

### Code style

- Small, single-responsibility files.
- Typed content.
- No prop-drilling of the data source.
- Tests: Vitest for the content layer and pure utils; Playwright for page behavior.

---

## 6. Commands Reference

Always run the following commands to format, lint, and run tests:

```bash
pnpm install       # Install dependencies
pnpm dev           # Launch development server (http://localhost:5173)
pnpm build         # Run type-check + production build
pnpm preview       # Preview the production build
pnpm lint          # Run ESLint check
pnpm format        # Run Prettier formatter
pnpm test          # Run Vitest unit tests
pnpm test:e2e      # Run Playwright E2E tests
```

### Tooling (MCP)

- **Always use Context7** (`resolve-library-id` / `query-docs`) to look up modern APIs/libraries before writing code — training data may be stale.
- **Use the Playwright MCP server** whenever browser automation is required (driving the app, inspecting the DOM, taking screenshots, verifying page behavior).

---

## 7. Swapping to Firebase RTDB (Later)

1. Add `src/content/RtdbContentRepository.ts` implementing `ContentRepository` (`getContent(): Promise<SiteContent>`), fetching from RTDB and falling back to the bundled snapshot.
2. Change the one binding in `src/content/content.ts` to use it.
   Nothing in the UI changes — the seam is already async.

---

## 8. Phase Map / TODO (Build in this order)

This repository is currently **scaffold only**. Deferred work, in order:

1. ~~**Design tokens / Tailwind theme** — colors, typography, spacing.~~ Done — see the "Design System" section above.
2. ~~**Shared components** — Header, Footer, Nav, Gallery; `blocks/` renderers per `Block.type`.~~ Done — see `src/components/` and `/estilo`.
3. **Pages / content** — home page **done** (redesign implemented: Hero, História, Missão/Visão/Valores, featured Serviços; reusable section components in `src/components/sections/`). Remaining: historia, servicos (+ `/servicos/:slug`), momentos, contato; bulk image migration; full content types + runtime validation.
4. **SEO prerender** — add `vite-react-ssg` for static HTML per route + per-page `<title>` / Open Graph tags.
5. **Firebase RTDB** — `RtdbContentRepository` + runtime fetch with fallback.
