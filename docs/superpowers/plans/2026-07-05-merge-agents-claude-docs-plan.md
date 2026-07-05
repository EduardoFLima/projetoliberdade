# Merge AGENTS.md and CLAUDE.md Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the important details from `CLAUDE.md` and `AGENTS.md` under `AGENTS.md`, and update `CLAUDE.md` to reference `AGENTS.md`.

**Architecture:** Consolidate stack, commands, design conventions, dependencies boundaries, and project guidelines under a single file (`AGENTS.md`). Replace `CLAUDE.md` with a standard import reference. Verify syntax, formatting, and linting.

**Tech Stack:** Markdown

## Global Constraints
- Preserve formatting, structure, and headers.
- Keep "The dependency rule (non-negotiable)", "Content conventions", "Tooling (MCP)", and "Code style" sections exactly as defined.

---

### Task 1: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Replace contents of AGENTS.md with the consolidated documentation**
- [ ] **Step 2: Commit AGENTS.md changes**

```bash
git add AGENTS.md
git commit -m "docs: merge CLAUDE.md details into AGENTS.md"
```

---

### Task 2: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace CLAUDE.md contents with the pointer referencing AGENTS.md**
- [ ] **Step 2: Commit CLAUDE.md changes**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to reference AGENTS.md"
```

---

### Task 3: Verify Repository Formatting and Linting

- [ ] **Step 1: Run Prettier formatting check**

Run: `pnpm format`
Expected: Formatting completes with no errors.

- [ ] **Step 2: Run ESLint check**

Run: `pnpm lint`
Expected: Linter completes with no errors.

- [ ] **Step 3: Run Vitest unit tests**

Run: `pnpm test`
Expected: Unit tests pass.

- [ ] **Step 4: Run production build**

Run: `pnpm build`
Expected: TypeScript check and build succeed.
