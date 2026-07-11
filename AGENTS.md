# AGENTS.md — AI Agent Guidelines & Superpowers integration

Welcome! This file provides guidelines for AI coding agents (such as Google Jules, Claude Code, Cursor, Gemini, and Codex) working on the **Projeto Liberdade** repository.

> [!IMPORTANT]
> Read [README.md](./README.md) first — it is the source of truth for the project overview, architecture, content model, design system, tech stack, project structure, the dependency rule, commands, and roadmap. This file only covers **how agents should work**; it does not repeat that material.

> [!IMPORTANT]
> This repository strictly follows the **Superpowers** agentic software development methodology. You are required to follow it for every task you perform.

---

## 1. Superpowers Methodology Integration

All agent skills are checked into the repository under the [.superpowers/skills/](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills) folder. You **MUST** read and invoke the appropriate skills before taking actions or responding:

1. **Bootstrap & Core Rule**: Read and follow [.superpowers/skills/using-superpowers/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/using-superpowers/SKILL.md) before any action—including clarifying questions, planning, or editing files.
   - _Rule:_ Check for relevant skills before every task. This is a mandatory workflow.
2. **Brainstorming & Requirements**: Run [.superpowers/skills/brainstorming/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/brainstorming/SKILL.md) before starting any implementation. Explore the user's intent, verify design choices, and align on requirements.
3. **Implementation Planning**: Run [.superpowers/skills/writing-plans/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/writing-plans/SKILL.md) to build a step-by-step plan specifying exact file paths and verification commands.
4. **Test-Driven Development (TDD)**: Enforce the RED-GREEN-REFACTOR cycle using [.superpowers/skills/test-driven-development/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/test-driven-development/SKILL.md). You MUST write failing tests first, verify they fail, write minimal code to make them pass, and refactor.
5. **Systematic Debugging**: If you encounter a bug or test failure, use [.superpowers/skills/systematic-debugging/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/systematic-debugging/SKILL.md) to trace the root cause systematically.
6. **Task & Fix Verification**: Before declaring any task complete, you MUST use [.superpowers/skills/verification-before-completion/SKILL.md](file:///Users/eduardolima/projects/projetoliberdade/.superpowers/skills/verification-before-completion/SKILL.md) and run all project verification commands (see [README.md](./README.md) for the lint / test / build commands).
7. **Task Tracking**: Maintain a task artifact (markdown checklist) at the start of any multi-step task, updating it as you progress. Do not use `manage_task` (which is for background processes) for task tracking.

---

## 2. Working in this repository

Before writing code, read the following in [README.md](./README.md):

- **Architecture** — the data-flow diagram, the project structure, and **the dependency rule**: the data-source boundary is non-negotiable. Files under `features`, `components`, and `layouts` never import `content.json` or reference Firebase directly; content flows down via the router `Outlet` context.
- **Content and design** — the content model (English keys, Portuguese values, typed blocks) and the "Organic Freedom" design system (tokens in `src/index.css`; components viewable at `/estilo`).
- **Development** — tech stack, prerequisites, and the run / test commands.
- **Roadmap** — current status and build order.

Follow the existing code style: small single-responsibility files, typed content, no prop-drilling of the data source, and Prettier defaults (no semicolons, single quotes, trailing commas).

---

## 3. Tooling (MCP)

- **Always use Context7** (`resolve-library-id` / `query-docs`) to look up modern APIs/libraries before writing code — training data may be stale.
- **Use the Playwright MCP server** whenever browser automation is required (driving the app, inspecting the DOM, taking screenshots, verifying page behavior).
