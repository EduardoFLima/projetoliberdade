# CI Test Workflow — Design

**Date:** 2026-07-17
**Status:** Approved (design), pending spec review

## Summary

Add the repository's first GitHub Actions workflow: `.github/workflows/tests.yml`. It runs on every push to `master` (which includes PR merges) and executes two parallel jobs — `unit` (lint, format check, Vitest) and `e2e` (production build + Playwright against `vite preview`). Supporting changes: `playwright.config.ts` becomes CI-conditional so e2e tests the production bundle in CI, `package.json` gains a `packageManager` field to pin pnpm, and `README.md` documents the CI setup (README is the repo's source of truth for tooling — no dedicated CI doc).

## Goals

- Unit and e2e tests run as **separate jobs**, so one suite's failure never hides the other's result.
- Triggered on **every push to `master`** — direct pushes and PR merges alike.
- E2E tests exercise the **production build** (`vite build` + `vite preview`), not the dev server, in CI.
- Static verification (ESLint, Prettier check, `tsc -b` via the build) runs as part of the same workflow.
- CI uses the **same pnpm version as local development** (11.9.0), with store caching for speed.
- On e2e failure, the Playwright HTML report (traces/screenshots) is available as a workflow artifact.
- The CI setup is documented in `README.md` (the repo's source of truth for tooling and commands).

## Non-goals

- No `pull_request` trigger (user decision: push-to-master only).
- No deployment, release, or preview-environment steps.
- No cross-browser matrix — chromium only, matching the existing Playwright config.
- No test sharding; the suites are small.

## Trigger

```yaml
on:
  push:
    branches: [master]
```

A PR merge into `master` is itself a push to `master`, so a single trigger covers both cases the user named.

## Files changed

### 1. `.github/workflows/tests.yml` (new)

Workflow name: **Tests**. Two parallel jobs on `ubuntu-latest`, each starting with the same setup sequence:

1. `actions/checkout@v5`
2. `pnpm/action-setup@v6` with `cache: true` — installs pnpm (version read from the `packageManager` field in `package.json`) and caches the pnpm store keyed on `pnpm-lock.yaml`
3. `actions/setup-node@v6` with `node-version: 22` (satisfies the `engines` constraint `^20.19.0 || >=22.12.0`)
4. `pnpm install --frozen-lockfile`

**Job `unit`:**

| Step | Command |
|---|---|
| Lint | `pnpm lint` |
| Format check | `pnpm format:check` |
| Unit tests | `pnpm test` |

**Job `e2e`** (`timeout-minutes: 60`, per Playwright's official CI recipe):

| Step | Command |
|---|---|
| Build (includes `tsc -b` typecheck) | `pnpm build` |
| Install browser | `pnpm exec playwright install --with-deps chromium` |
| E2E tests | `pnpm test:e2e` |
| Upload report | `actions/upload-artifact@v5`, `if: ${{ !cancelled() }}`, path `playwright-report/`, retention 30 days |

The build lives in the e2e job (not a separate job) because e2e needs the built `dist/` anyway — no duplicated work, and the typecheck gate comes for free.

### 2. `playwright.config.ts` (modified)

CI-conditional web server so CI tests the production bundle while local runs keep the dev-server workflow:

```ts
const isCI = !!process.env.CI
const port = isCI ? 4173 : 5173

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: isCI ? 'pnpm preview' : 'pnpm dev',
    url: `http://localhost:${port}`,
    reuseExistingServer: !isCI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

- `pnpm preview` serves the already-built `dist/` on port 4173; the workflow's build step runs first.
- `forbidOnly` fails CI if a stray `.only` is committed; `retries: 2` in CI is Playwright's scaffold default for flake tolerance.
- Local behavior is unchanged: dev server on 5173, reuse if already running.

### 3. `package.json` (modified)

Add `"packageManager": "pnpm@11.9.0"` (the version in local use). `pnpm/action-setup@v6` reads this field, so the workflow never hardcodes a pnpm version.

### 4. `README.md` (modified) — documentation

Per the repo rule that README owns tooling and commands, CI is documented in README rather than a dedicated file:

- **New subsection `### Continuous Integration`** under **Development**, after **Testing**, covering:
  - Trigger: every push to `master` (including PR merges), workflow file `.github/workflows/tests.yml`.
  - The two parallel jobs and what each runs (`unit`: lint, format check, Vitest; `e2e`: build, Playwright vs the production bundle).
  - Where to find failure forensics: the `playwright-report` artifact on the workflow run page (kept 30 days).
  - How to reproduce each job locally (the same command sequences listed under Verification below).
- **Testing section note:** `CI=1 pnpm test:e2e` runs Playwright the way CI does — against the production build via `pnpm preview` on port 4173 (requires `pnpm build` first); without `CI`, e2e uses the dev server on 5173.
- **Prerequisites touch-up:** mention that pnpm is pinned via the `packageManager` field, so `corepack enable` picks the right version automatically.

## Error handling / failure modes

- **Independent jobs:** `unit` and `e2e` run in parallel with no `needs` edge; each reports its own status.
- **Stale lockfile:** `--frozen-lockfile` fails the install step immediately instead of silently regenerating.
- **E2E failure forensics:** the HTML report artifact is uploaded on failure (and success), skipped only if the run is cancelled.
- **Hung e2e run:** the 60-minute job timeout bounds runaway runs.

## Verification

Before committing, run each job's command sequence locally and confirm it passes:

```sh
pnpm lint && pnpm format:check && pnpm test        # unit job
pnpm build && CI=1 pnpm test:e2e                   # e2e job (production bundle path)
```

Then confirm the workflow itself on the first real push to `master`: both jobs appear, run in parallel, and pass.
