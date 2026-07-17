# CI Test Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions workflow that runs unit tests and e2e tests as two separate parallel jobs on every push to `master`.

**Architecture:** A single workflow file (`.github/workflows/tests.yml`) with two independent jobs. The `unit` job runs lint, format check, and Vitest. The `e2e` job builds the production bundle and runs Playwright against `vite preview`. Supporting config changes make Playwright CI-aware (production bundle, HTML report, traces) and pin pnpm. This is a config/docs change — there is no application source to unit-test, so tasks are verified by running the exact commands CI will run and by validating the workflow file, rather than by RED-GREEN unit cycles.

**Tech Stack:** GitHub Actions, pnpm 11.9.0, Node 22, Vite 8, Vitest 4, Playwright 1.61.

**Spec:** `docs/superpowers/specs/2026-07-17-ci-test-workflow-design.md`

## Global Constraints

- Trigger: `on: push: branches: [master]` only — no `pull_request` trigger.
- Two parallel jobs, no `needs` edge between them: `unit` and `e2e`.
- Action versions (verified against the GitHub API 2026-07-17): `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`, `pnpm/action-setup@v6`.
- Runner: `ubuntu-latest`. Node: `22`. pnpm version comes from the `packageManager` field in `package.json` — never hardcoded in the workflow.
- pnpm install is always `pnpm install --frozen-lockfile`; `pnpm/action-setup` step order is before `actions/setup-node`, and its `run_install` is left at the default (no auto-install).
- e2e in CI tests the production bundle (`vite build` + `pnpm preview` on port 4173), chromium only.
- Prettier defaults: no semicolons, single quotes, trailing commas (already enforced by repo config — new `.ts` must match).
- All commands run via `pnpm`.

---

## File Structure

- `.github/workflows/tests.yml` — **create.** The workflow. Owns trigger, both jobs, caching, artifact upload.
- `playwright.config.ts` — **modify.** Becomes CI-conditional: production bundle, HTML+github reporters, traces/screenshots. Everything Playwright-runtime lives here, not in the workflow.
- `package.json` — **modify.** Add `packageManager` field (pnpm pin). One line.
- `.prettierignore` — **modify.** Add `.claude` so local `format:check` matches CI.
- `README.md` — **modify.** Document CI under Development; touch up Testing and Prerequisites; add TOC entry.

Task order: config prerequisites first (`.prettierignore`, `package.json`, `playwright.config.ts`) so the workflow's commands are known-good locally before the workflow references them, then the workflow, then docs.

---

### Task 1: Fix local `format:check` so CI repro is clean

**Files:**
- Modify: `.prettierignore`

**Interfaces:**
- Consumes: nothing.
- Produces: a clean `pnpm format:check` on the working tree, which Tasks 3–5 rely on for their verification steps.

**Why:** `pnpm format:check` currently fails on 67 files of untracked `.claude/` worktree build output. CI is unaffected (untracked), but every local verification step in this plan runs `format:check`, so this must be clean first. Mirrors the existing `.superpowers` entry.

- [ ] **Step 1: Confirm the failure exists**

Run: `pnpm format:check`
Expected: FAIL — exit code 1, warnings listing files under `.claude/worktrees/...`.

- [ ] **Step 2: Add `.claude` to `.prettierignore`**

The file currently reads:

```
node_modules
dist
pnpm-lock.yaml
docs
.superpowers
test-results
playwright-report
```

Add `.claude` after `.superpowers`:

```
node_modules
dist
pnpm-lock.yaml
docs
.superpowers
.claude
test-results
playwright-report
```

- [ ] **Step 3: Verify `format:check` now passes**

Run: `pnpm format:check`
Expected: PASS — "All matched files use Prettier code style!" (exit code 0).

- [ ] **Step 4: Commit**

```bash
git add .prettierignore
git commit -m "chore: ignore .claude in Prettier so local format:check matches CI"
```

---

### Task 2: Pin pnpm via `packageManager`

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: the `packageManager: "pnpm@11.9.0"` field that `pnpm/action-setup@v6` reads in Task 4 to select the pnpm version.

- [ ] **Step 1: Add the `packageManager` field**

In `package.json`, add the field after `"type": "module",` (line 5). The top of the file becomes:

```json
{
  "name": "projeto-liberdade",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "packageManager": "pnpm@11.9.0",
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  },
```

- [ ] **Step 2: Verify pnpm still resolves and the file is valid JSON**

Run: `pnpm exec node -e "console.log(require('./package.json').packageManager)"`
Expected: prints `pnpm@11.9.0` (also proves the JSON parses).

- [ ] **Step 3: Verify install still works with the pin**

Run: `pnpm install --frozen-lockfile`
Expected: PASS — "Already up to date" or a clean install, exit code 0, no lockfile change.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: pin pnpm via packageManager field for CI"
```

---

### Task 3: Make Playwright config CI-aware

**Files:**
- Modify: `playwright.config.ts`
- Exercises (no new test file — the existing specs under `tests/e2e/` are the tests): `tests/e2e/smoke.spec.ts` and siblings

**Interfaces:**
- Consumes: `packageManager` pin (Task 2) is unrelated here; this task consumes the existing `pnpm preview` / `pnpm dev` scripts and `tests/e2e/*.spec.ts`.
- Produces: when `CI` is set, `pnpm test:e2e` serves the built `dist/` on port 4173 and writes a `playwright-report/` directory. Task 4's e2e job and Task 5's docs depend on this behavior.

**Why:** Playwright's default reporter is `dot` in CI (no HTML), and `trace`/`screenshot` default to `off`. Without this change the workflow's artifact upload would find nothing. The dev/preview split also makes CI test the production bundle.

- [ ] **Step 1: Write the config**

Replace the entire contents of `playwright.config.ts` with:

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

- [ ] **Step 2: Verify the local (non-CI) path is unchanged**

Run: `pnpm test:e2e`
Expected: PASS — Playwright starts the dev server on 5173, runs the specs with the `list` reporter, all green. No `playwright-report/` browser popup.

- [ ] **Step 3: Verify the CI path builds, serves the bundle, and writes a report**

Run: `pnpm build && CI=1 pnpm test:e2e`
Expected: PASS — build succeeds; Playwright starts `pnpm preview` on 4173, runs the specs, all green; a `playwright-report/` directory now exists (`ls playwright-report/index.html` succeeds).

- [ ] **Step 4: Confirm the config passes lint and format**

Run: `pnpm lint && pnpm format:check`
Expected: PASS — exit code 0 (catches any semicolon/quote drift in the new file).

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts
git commit -m "test(e2e): run against production bundle with HTML report in CI"
```

---

### Task 4: Add the GitHub Actions workflow

**Files:**
- Create: `.github/workflows/tests.yml`

**Interfaces:**
- Consumes: `packageManager` pin (Task 2), the `preview`/report behavior of `playwright.config.ts` (Task 3), and the existing scripts `lint`, `format:check`, `test`, `build`, `test:e2e`.
- Produces: the `unit` and `e2e` job statuses on every push to `master`, and the `playwright-report` artifact.

**Why:** This is the deliverable. It wires the verified-local command sequences into CI as two parallel jobs.

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/tests.yml` with exactly:

```yaml
name: Tests

on:
  push:
    branches: [master]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
        with:
          cache: true
      - uses: actions/setup-node@v7
        with:
          node-version: 22
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm test

  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
        with:
          cache: true
      - uses: actions/setup-node@v7
        with:
          node-version: 22
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

- [ ] **Step 2: Validate the YAML parses**

Run: `pnpm exec node -e "const y=require('fs').readFileSync('.github/workflows/tests.yml','utf8'); if(!/^name: Tests/m.test(y)||!/jobs:/.test(y)) throw new Error('bad'); console.log('yaml structure ok')"`
Expected: prints `yaml structure ok`.

- [ ] **Step 3: Lint the workflow with actionlint if available (best-effort)**

Run: `command -v actionlint >/dev/null && actionlint .github/workflows/tests.yml && echo "actionlint clean" || echo "actionlint not installed — skipping"`
Expected: either `actionlint clean` or the skip message. Do not install actionlint just for this.

- [ ] **Step 4: Confirm the exact command sequences already pass locally**

The workflow only runs commands verified in Tasks 1–3. Re-run both job sequences to confirm nothing regressed:

Run: `pnpm lint && pnpm format:check && pnpm test`
Expected: PASS (the `unit` job).

Run: `pnpm build && CI=1 pnpm test:e2e`
Expected: PASS, `playwright-report/` written (the `e2e` job, minus the runner-only browser-install step).

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/tests.yml
git commit -m "ci: run unit and e2e tests on push to master"
```

---

### Task 5: Document CI in the README

**Files:**
- Modify: `README.md` — Table of Contents (line 22 area), Prerequisites (~124), Testing (~142–150), and a new Continuous Integration subsection after Testing.

**Interfaces:**
- Consumes: the behavior established in Tasks 1–4 (jobs, artifact, `CI=1` local repro).
- Produces: nothing downstream — this is the final task.

- [ ] **Step 1: Add the TOC entry**

In the Table of Contents, under `- [Development](#development)`, add a `Continuous integration` line after `Testing`:

```markdown
- [Development](#development)
  - [Tech stack](#tech-stack)
  - [Prerequisites](#prerequisites)
  - [Running the app](#running-the-app)
  - [Testing](#testing)
  - [Continuous integration](#continuous-integration)
```

- [ ] **Step 2: Touch up Prerequisites**

The Prerequisites list currently reads:

```markdown
- **Node.js** 20+ (Vite 8 / React 19 baseline)
- **pnpm** — install with `corepack enable` or `npm install -g pnpm`
```

Replace the pnpm line so it notes the pin:

```markdown
- **Node.js** 20+ (Vite 8 / React 19 baseline)
- **pnpm** — run `corepack enable`; the version is pinned via the `packageManager` field in `package.json`, so Corepack selects the right one automatically
```

- [ ] **Step 3: Add a CI note to the Testing section**

The Testing section currently ends with:

```markdown
Vitest covers the content layer, selectors, pure utils, and component behavior (jsdom); Playwright specs live under `tests/e2e/` and cover page behavior in a real browser.
```

Add a paragraph after it:

```markdown
By default `pnpm test:e2e` runs Playwright against the dev server on port 5173. To reproduce CI locally, run `pnpm build` then `CI=1 pnpm test:e2e` — this serves the production build via `pnpm preview` on port 4173 and writes an HTML report to `playwright-report/`.
```

- [ ] **Step 4: Add the Continuous Integration subsection**

Immediately before the `## Roadmap` heading, add:

```markdown
### Continuous integration

Every push to `master` (including PR merges) triggers the [`.github/workflows/tests.yml`](./.github/workflows/tests.yml) workflow, which runs two parallel jobs:

- **`unit`** — `pnpm lint`, `pnpm format:check`, then `pnpm test` (Vitest).
- **`e2e`** — `pnpm build`, then `pnpm test:e2e` (Playwright, chromium) against the production bundle served by `pnpm preview`.

When an e2e run fails, the Playwright HTML report — with traces and failure screenshots — is uploaded as a `playwright-report` artifact on the workflow run page (retained 30 days). Reproduce either job locally with the commands in [Testing](#testing).
```

- [ ] **Step 5: Verify docs pass format check and links are internally consistent**

Run: `pnpm format:check`
Expected: PASS (`docs` is Prettier-ignored, but README is not — this catches formatting drift in the edits).

Manually confirm the new `#continuous-integration` TOC anchor matches the new `### Continuous integration` heading slug.

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "docs: document CI workflow in README"
```

---

## Self-Review

**Spec coverage** — every spec section maps to a task:

- Trigger (`push`/`master`) → Task 4.
- Two parallel jobs, `unit` + `e2e` → Task 4.
- Setup sequence, action versions, step order, `--frozen-lockfile` → Task 4 (Global Constraints).
- File 1 `.github/workflows/tests.yml` → Task 4.
- File 2 `playwright.config.ts` (CI-conditional, reporter, trace/screenshot) → Task 3.
- File 3 `package.json` `packageManager` → Task 2.
- File 4 `.prettierignore` `.claude` → Task 1.
- File 5 `README.md` (CI subsection, Testing note, Prerequisites, TOC) → Task 5.
- Review findings 1–4 (action versions, HTML reporter, traces, `.claude` ignore) → baked into Tasks 1, 3, 4.
- Verification command sequences → verification steps in Tasks 3 and 4.

**Placeholder scan:** No TBD/TODO; every code and config step shows the full content to write.

**Type/name consistency:** Script names (`lint`, `format:check`, `test`, `build`, `test:e2e`), ports (5173 dev / 4173 preview), artifact name (`playwright-report`), and action versions (`checkout@v7`, `setup-node@v7`, `upload-artifact@v7`, `action-setup@v6`) are identical across every task and match the spec.
