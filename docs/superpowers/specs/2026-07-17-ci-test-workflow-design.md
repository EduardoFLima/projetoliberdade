# CI Test Workflow — Design

**Date:** 2026-07-17
**Status:** Approved (design), pending spec review
**Revised:** 2026-07-17 — fresh-eyes review corrected action versions and fixed the Playwright reporting gap (see [Review findings](#review-findings)).

## Summary

Add the repository's first GitHub Actions workflow: `.github/workflows/tests.yml`. It runs on every push to `master` (which includes PR merges) and executes two parallel jobs — `unit` (lint, format check, Vitest) and `e2e` (production build + Playwright against `vite preview`). Supporting changes: `playwright.config.ts` becomes CI-conditional (production bundle, HTML report, traces), `package.json` gains a `packageManager` field to pin pnpm, `.prettierignore` gains `.claude`, and `README.md` documents the CI setup (README is the repo's source of truth for tooling — no dedicated CI doc).

## Goals

- Unit and e2e tests run as **separate jobs**, so one suite's failure never hides the other's result.
- Triggered on **every push to `master`** — direct pushes and PR merges alike.
- E2E tests exercise the **production build** (`vite build` + `vite preview`), not the dev server, in CI.
- Static verification (ESLint, Prettier check, `tsc -b` via the build) runs as part of the same workflow.
- CI uses the **same pnpm version as local development** (11.9.0), with store caching for speed.
- On e2e failure, the Playwright HTML report **with traces and screenshots** is available as a workflow artifact.
- The CI setup is documented in `README.md` (the repo's source of truth for tooling and commands).
- Each job's command sequence is **reproducible locally**, with no spurious failures.

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

1. `actions/checkout@v7`
2. `pnpm/action-setup@v6` with `cache: true` — installs pnpm (version read from the `packageManager` field in `package.json`) and caches the pnpm store keyed on `pnpm-lock.yaml`
3. `actions/setup-node@v7` with `node-version: 22` (satisfies the `engines` constraint `^20.19.0 || >=22.12.0`)
4. `pnpm install --frozen-lockfile`

Step order matters: `pnpm/action-setup` runs before `setup-node` (the conventional order — the runner's preinstalled Node executes the pnpm install and store-path lookup, then `setup-node` pins the version used for the actual test run). The explicit install step is required because `action-setup`'s `run_install` input defaults to null, which performs no install.

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
| Upload report | `actions/upload-artifact@v7`, `if: ${{ !cancelled() }}`, path `playwright-report/`, retention 30 days |

The build lives in the e2e job (not a separate job) because e2e needs the built `dist/` anyway — no duplicated work, and the typecheck gate comes for free.

### 2. `playwright.config.ts` (modified)

CI-conditional web server so CI tests the production bundle while local runs keep the dev-server workflow, plus the reporting config the artifact upload depends on:

```ts
import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const port = isCI ? 4173 : 5173

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: isCI ? 'pnpm preview' : 'pnpm dev',
    url: `http://localhost:${port}`,
    reuseExistingServer: !isCI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

- `pnpm preview` serves the already-built `dist/` on port 4173 (Vite preview's default); the workflow's build step runs first.
- **`reporter` is what makes `playwright-report/` exist.** Playwright's default reporter is `dot` in CI and `list` otherwise — neither writes an HTML report, so without this the upload step would find no files. `open: 'never'` stops the reporter from trying to launch a browser.
- The `github` reporter adds inline failure annotations to the workflow run.
- `trace: 'on-first-retry'` and `screenshot: 'only-on-failure'` populate the report with forensics; both default to `off`. Traces are produced on the first retry, which only happens in CI (`retries: 2`).
- `forbidOnly` fails CI if a stray `.only` is committed.
- Local behavior is unchanged: dev server on 5173, `list` reporter, reuse if already running.

### 3. `package.json` (modified)

Add `"packageManager": "pnpm@11.9.0"` (the version in local use). `pnpm/action-setup@v6` reads this field, so the workflow never hardcodes a pnpm version. The action errors on a mismatch if a `version` input is also given, so the workflow omits it.

### 4. `.prettierignore` (modified)

Add `.claude` — the agent workspace directory, which contains build output from worktrees. It is untracked, so CI is unaffected, but without this `pnpm format:check` fails locally with 67 irrelevant errors, breaking the local reproduction the README documents. This mirrors the existing `.superpowers` entry.

### 5. `README.md` (modified) — documentation

Per the repo rule that README owns tooling and commands, CI is documented in README rather than a dedicated file:

- **New subsection `### Continuous Integration`** under **Development**, after **Testing**, covering:
  - Trigger: every push to `master` (including PR merges), workflow file `.github/workflows/tests.yml`.
  - The two parallel jobs and what each runs (`unit`: lint, format check, Vitest; `e2e`: build, Playwright vs the production bundle).
  - Where to find failure forensics: the `playwright-report` artifact on the workflow run page (kept 30 days), containing traces and failure screenshots.
  - How to reproduce each job locally (the command sequences under [Verification](#verification)).
- **Testing section note:** `CI=1 pnpm test:e2e` runs Playwright the way CI does — against the production build via `pnpm preview` on port 4173 (requires `pnpm build` first); without `CI`, e2e uses the dev server on 5173.
- **Prerequisites touch-up:** mention that pnpm is pinned via the `packageManager` field, so `corepack enable` picks the right version automatically.

## Error handling / failure modes

- **Independent jobs:** `unit` and `e2e` run in parallel with no `needs` edge; each reports its own status.
- **Stale lockfile:** `--frozen-lockfile` fails the install step immediately instead of silently regenerating.
- **E2E failure forensics:** the HTML report artifact is uploaded on failure (and success), skipped only if the run is cancelled.
- **Hung e2e run:** the 60-minute job timeout bounds runaway runs.
- **Flake tolerance:** `retries: 2` in CI only. This trades some flake-masking for a stable signal on `master`; a test that only passes on retry is still reported as flaky in the run summary.

## Review findings

A fresh-eyes review of the first draft found four issues, all corrected above. Recorded here so the implementation plan does not reintroduce them:

1. **Action versions were stale.** The draft pinned `checkout@v5`, `setup-node@v6`, and `upload-artifact@v5`, copied from mixed-vintage documentation snippets. Verified against the GitHub API: current majors are **v7** for all three (`pnpm/action-setup@v6` was correct). All four floating major tags confirmed to exist.
2. **The HTML report would never have been produced** — the significant one. The draft's artifact upload assumed `playwright-report/` exists, but Playwright's default reporter (`dot` in CI) writes no HTML. The upload step would have silently uploaded nothing on every run, and the failure forensics the design promises would not exist. Fixed by configuring `reporter` explicitly.
3. **Traces and screenshots were promised but not configured.** `trace`, `screenshot`, and `video` all default to `off`; the draft's claim that the report would contain them was unfounded. Fixed via `use`.
4. **`pnpm format:check` fails locally** on `.claude/` worktree build output (67 files). CI is unaffected (the directory is untracked), but the documented local reproduction would fail confusingly. Fixed via `.prettierignore`.

Verified as already correct: `pnpm lint`, `pnpm test`, and `pnpm build` all pass on the current tree; ESLint (`ignores: ['dist']`) and `.prettierignore` already exclude build output; Node 22 satisfies the `engines` constraint; the explicit install step is required given `run_install`'s default.

## Verification

Before committing, run each job's command sequence locally and confirm it passes:

```sh
pnpm lint && pnpm format:check && pnpm test        # unit job
pnpm build && CI=1 pnpm test:e2e                   # e2e job (production bundle path)
```

`CI=1 pnpm test:e2e` must be checked specifically: it exercises the `preview`/4173 branch of the config and writes `playwright-report/`. Confirm that directory exists and opens afterwards — that is the artifact the workflow uploads.

Then confirm the workflow itself on the first real push to `master`: both jobs appear, run in parallel, and pass.
