---
owner: Clayton
last_reviewed: 2026-06-18
source_of_truth_for: Paperclip operating contract for agents — extends IDE constitution
supersedes: null
---

# AGENTS.md


> **Why this exists.** Entry point for any agent in the Paperclip company-orchestrator repo. Inherits IDE constitution; Paperclip-specific rules below.

Guidance for human and AI contributors working in this repository.

## 1. Purpose

Paperclip is a control plane for AI-agent companies.
The current implementation target is V1 and is defined in `doc/SPEC-implementation.md`.

## 2. Read This First

Before making changes, read in this order:

1. `doc/GOAL.md`
2. `doc/PRODUCT.md`
3. `doc/SPEC-implementation.md`
4. `doc/DEVELOPING.md`
5. `doc/DATABASE.md`

`doc/SPEC.md` is long-horizon product context.
`doc/SPEC-implementation.md` is the concrete V1 build contract.

## 3. Repo Map

- `server/`: Express REST API and orchestration services
- `ui/`: React + Vite board UI
- `packages/db/`: Drizzle schema, migrations, DB clients
- `packages/shared/`: shared types, constants, validators, API path constants
- `packages/adapters/`: agent adapter implementations (Claude, Codex, Cursor, etc.)
- `packages/adapter-utils/`: shared adapter utilities
- `packages/plugins/`: plugin system packages
- `doc/`: operational and product docs

## 4. Dev Setup (Auto DB)

Use embedded PGlite in dev by leaving `DATABASE_URL` unset.

```sh
pnpm install
pnpm dev
```

This starts:

- API: `http://localhost:3100`
- UI: `http://localhost:3100` (served by API server in dev middleware mode)

Quick checks:

```sh
curl http://localhost:3100/api/health
curl http://localhost:3100/api/companies
```

Reset local dev DB:

```sh
rm -rf data/pglite
pnpm dev
```

## 5. Core Engineering Rules

1. Keep changes company-scoped.
Every domain entity should be scoped to a company and company boundaries must be enforced in routes/services.

2. Keep contracts synchronized.
If you change schema/API behavior, update all impacted layers:
- `packages/db` schema and exports
- `packages/shared` types/constants/validators
- `server` routes/services
- `ui` API clients and pages

3. Preserve control-plane invariants.
- Single-assignee task model
- Atomic issue checkout semantics
- Approval gates for governed actions
- Budget hard-stop auto-pause behavior
- Activity logging for mutating actions

4. Do not replace strategic docs wholesale unless asked.
Prefer additive updates. Keep `doc/SPEC.md` and `doc/SPEC-implementation.md` aligned.

5. Keep repo plan docs dated and centralized.
When you are creating a plan file in the repository itself, new plan documents belong in `doc/plans/` and should use `YYYY-MM-DD-slug.md` filenames. This does not replace Paperclip issue planning: if a Paperclip issue asks for a plan, update the issue `plan` document per the `paperclip` skill instead of creating a repo markdown file.

6. Attach inspectable generated artifacts.
When your task produces a user-inspectable deliverable file, follow the Paperclip skill's "Generated Artifacts and Work Products" workflow before final disposition. In this repo, prefer the self-contained skill helper at `skills/paperclip/scripts/paperclip-upload-artifact.sh` so the file is available through the Paperclip API, create/update an artifact work product when the file is the deliverable, link the uploaded artifact in the final issue comment, and then set status. Do not rely on local filesystem paths as the only access path. If an important file intentionally remains workspace-only, create/update a work product with `metadata.resourceRef.kind: "workspace_file"` and a workspace-relative path, then name that work product and path in the final comment. Treat browse/search as a fallback for recovering workspace files, not the preferred deliverable path. See `doc/AGENT-ARTIFACTS.md` for details and `.mp4`/`.webm` examples.

## 6. Database Change Workflow

When changing data model:

1. Edit `packages/db/src/schema/*.ts`
2. Ensure new tables are exported from `packages/db/src/schema/index.ts`
3. Generate migration:

```sh
pnpm db:generate
```

4. Validate compile:

```sh
pnpm -r typecheck
```

Notes:
- `packages/db/drizzle.config.ts` reads compiled schema from `dist/schema/*.js`
- `pnpm db:generate` compiles `packages/db` first

## 7. Verification Before Hand-off

Default local/agent test path:

```sh
pnpm test
```

This is the cheap default and only runs the Vitest suite. Browser suites stay opt-in:

```sh
pnpm test:e2e
pnpm test:release-smoke
```

Run the browser suites only when your change touches them or when you are explicitly verifying CI/release flows.

For normal issue work, run the smallest relevant verification first. Do not default to repo-wide typecheck/build/test on every heartbeat when a narrower check is enough to prove the change.

Run this full check before claiming repo work done in a PR-ready hand-off, or when the change scope is broad enough that targeted checks are not sufficient:

```sh
pnpm -r typecheck
pnpm test:run
pnpm build
```

If anything cannot be run, explicitly report what was not run and why.

## 8. API and Auth Expectations

- Base path: `/api`
- Board access is treated as full-control operator context
- Agent access uses bearer API keys (`agent_api_keys`), hashed at rest
- Agent keys must not access other companies

When adding endpoints:

- apply company access checks
- enforce actor permissions (board vs agent)
- write activity log entries for mutations
- return consistent HTTP errors (`400/401/403/404/409/422/500`)

## 9. UI Expectations

- Keep routes and nav aligned with available API surface
- Use company selection context for company-scoped pages
- Surface failures clearly; do not silently ignore API errors

## 10. Pull Request Requirements

When creating a pull request (via `gh pr create` or any other method), you **must** read and fill in every section of [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md). Do not craft ad-hoc PR bodies — use the template as the structure for your PR description. Required sections:

- **Thinking Path** — trace reasoning from project context to this change (see `CONTRIBUTING.md` for examples)
- **What Changed** — bullet list of concrete changes
- **Verification** — how a reviewer can confirm it works
- **Risks** — what could go wrong
- **Model Used** — the AI model that produced or assisted with the change (provider, exact model ID, context window, capabilities). Write "None — human-authored" if no AI was used.
- **Checklist** — all items checked

## 11. Definition of Done

A change is done when all are true:

1. Behavior matches `doc/SPEC-implementation.md`
2. Typecheck, tests, and build pass
3. Contracts are synced across db/shared/server/ui
4. Docs updated when behavior or commands change
5. PR description follows the [PR template](.github/PULL_REQUEST_TEMPLATE.md) with all sections filled in (including Model Used)

## 11. Fork-Specific: HenkDz/paperclip

This is a fork of `paperclipai/paperclip` with QoL patches and an **external-only** Hermes adapter story on branch `feat/externalize-hermes-adapter` ([tree](https://github.com/HenkDz/paperclip/tree/feat/externalize-hermes-adapter)).

### Branch Strategy

- `feat/externalize-hermes-adapter` → core has **no** `hermes-paperclip-adapter` dependency and **no** built-in `hermes_local` registration. Install Hermes via the Adapter Plugin manager (`@henkey/hermes-paperclip-adapter` or a `file:` path).
- Older fork branches may still document built-in Hermes; treat this file as authoritative for the externalize branch.

### Hermes (plugin only)

- Register through **Board → Adapter manager** (same as Droid). Type remains `hermes_local` once the package is loaded.
- UI uses generic **config-schema** + **ui-parser.js** from the package — no Hermes imports in `server/` or `ui/` source.
- Optional: `file:` entry in `~/.paperclip/adapter-plugins.json` for local dev of the adapter repo.
- Architecture decision and tradeoff rationale: `doc/plans/2026-06-18-hermes-adapter-packaging.md`.

### Local Dev

- Fork runs on port 3101+ (auto-detects if 3100 is taken by upstream instance)
- `npx vite build` hangs on NTFS — use `node node_modules/vite/bin/vite.js build` instead
- Server startup from NTFS takes 30-60s — don't assume failure immediately
- Kill ALL paperclip processes before starting: `pkill -f "paperclip"; pkill -f "tsx.*index.ts"`
- Vite cache survives `rm -rf dist` — delete both: `rm -rf ui/dist ui/node_modules/.vite`

### Fork QoL Patches (not in upstream)

These are local modifications in the fork's UI. If re-copying source, these must be re-applied:

1. **stderr_group** — amber accordion for MCP init noise in `RunTranscriptView.tsx`
2. **tool_group** — accordion for consecutive non-terminal tools (write, read, search, browser)
3. **Dashboard excerpt** — `LatestRunCard` strips markdown, shows first 3 lines/280 chars

### Plugin System

PR #2218 (`feat/external-adapter-phase1`) adds external adapter support. See root `AGENTS.md` for full details.

- Adapters can be loaded as external plugins via `~/.paperclip/adapter-plugins.json`
- The plugin-loader should have ZERO hardcoded adapter imports — pure dynamic loading
- `createServerAdapter()` must include ALL optional fields (especially `detectModel`)
- Built-in UI adapters can shadow external plugin parsers — remove built-in when fully externalizing
- Reference external adapters: Hermes (`@henkey/hermes-paperclip-adapter` or `file:`) and Droid (npm)

---

## IDE Integration (Novique-Internal)

> The section below applies only when working with this repo inside the Novique IDE workspace (`~/IDE/`). Upstream contributors can ignore it.

# Paperclip

> Inherits from: `IDE/CLAUDE.md` (IDE Constitution)

## Architectural Role

Paperclip is the **orchestration and delegation layer** for AI agents. It sits on top of the existing system — it does NOT replace it.

### Three-Layer Architecture

| Layer | Role | Examples |
|-------|------|----------|
| **IDE Infrastructure** | Execution | `bin/` wrappers, CRM, CR, RM scripts, automation |
| **OB1 (Open Brain)** | Standards + Validation | Entity types, schemas, workflows, validation rules |
| **Paperclip** | Orchestration only | Agent coordination, task delegation, dashboard |

### Critical Constraints

Paperclip **MUST NOT**:
- Store authoritative data (CRM/CR systems are source of truth)
- Invent schemas or workflows (OB1 defines these)
- Bypass CLI tools or APIs (IDE scripts are the execution layer)
- Create duplicate entities (idempotency is mandatory)
- Mutate data directly without tools

Paperclip **MUST**:
- Execute actions via approved IDE scripts (`bin/`, CRM, CR, RM)
- Respect OB1 validation and standards
- Treat existing systems as authoritative
- Follow RESOLVE → DIFF → EXECUTE → VALIDATE for all operations

### Operational Lifecycle

All work follows this mandatory sequence:

1. **RESOLVE** — Determine current state (never skip)
2. **DIFF** — Identify gaps vs. required state
3. **EXECUTE** — Only necessary actions, via approved tools
4. **VALIDATE** — OB1 enforcement (never skip)

### Idempotency Requirement

Before any "create" action:
- Check if entity already exists
- If exists → reuse, do NOT duplicate
- If not → create
- All operations must be safe to run multiple times

### Onboarding Model

| Workflow | When | Process |
|----------|------|---------|
| **New Entity** | Entity does not exist | Create all required components |
| **Existing Entity** (default) | Entity already exists | Reconcile: resolve → compare → create only missing → validate |

Most real-world cases are **existing entity** reconciliation.

---

## Overview

Open-source AI agent orchestration platform. Node.js server + React UI that coordinates a team of AI agents. Manages org charts, budgets, governance, goal alignment, and agent coordination.

**Upstream:** https://github.com/paperclipai/paperclip
**License:** MIT

## Technology Stack

- **Runtime:** Node.js >= 20
- **Language:** TypeScript (ESM)
- **Package Manager:** pnpm 9.15.4
- **Monorepo:** pnpm workspaces
- **Server:** Express + WebSocket
- **UI:** React (Vite)
- **Database:** PostgreSQL 17 (Drizzle ORM)
- **Auth:** better-auth
- **Testing:** Vitest (unit), Playwright (e2e)
- **Build:** esbuild + tsc
- **Container:** Docker / docker-compose

## Project Structure

```
paperclip/
├── .planning/          # Local planning files (git-ignored)
├── server/             # Express API server (@paperclipai/server)
├── ui/                 # React frontend (@paperclipai/ui)
├── cli/                # CLI tool
├── packages/
│   ├── db/             # Drizzle ORM schema, migrations, seeds
│   ├── shared/         # Shared types and utilities
│   ├── adapter-utils/  # Base adapter utilities
│   ├── adapters/       # LLM adapters (Claude, Codex, Cursor, Gemini, etc.)
│   └── plugins/        # Plugin system + examples
├── docker/             # Docker support files
├── docs/               # Documentation (Mintlify)
├── evals/              # Prompt evaluations
├── scripts/            # Build, release, and utility scripts
├── tests/              # e2e and release-smoke tests
├── skills/             # Agent skills
└── releases/           # Release artifacts
```

## Development Setup

```bash
# Install dependencies
pnpm install

# Copy environment file (if not done)
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Start PostgreSQL (via docker-compose)
docker-compose up -d db

# Run database migrations
pnpm db:migrate

# Start dev server (server + UI)
pnpm dev
```

## Common Tasks

```bash
# Development
pnpm dev              # Start dev server (watch mode)
pnpm dev:server       # Server only
pnpm dev:ui           # UI only
pnpm dev:list         # List running dev services
pnpm dev:stop         # Stop dev services

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:backup        # Backup database

# Testing
pnpm test             # Run unit tests (vitest watch)
pnpm test:run         # Run unit tests (single pass)
pnpm test:e2e         # Run Playwright e2e tests

# Build
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages

# Release
pnpm release          # Run release script
pnpm release:canary   # Canary release
pnpm release:stable   # Stable release
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://paperclip:paperclip@localhost:5432/paperclip` | PostgreSQL connection |
| `PORT` | `3100` | Server port |
| `SERVE_UI` | `false` | Serve UI from server (true in Docker) |
| `PAPERCLIP_DEPLOYMENT_MODE` | `authenticated` | Auth mode |
| `BETTER_AUTH_SECRET` | *(required)* | Auth secret key |

## Important Notes

- This is a fork/clone of the upstream `paperclipai/paperclip` repo
- The `data/` directory is git-ignored (runtime state)
- Database uses embedded-postgres for testing; real PostgreSQL for dev/prod
- Server runs on port 3100 by default -- check `port-registry.json` before changing
- If a required action cannot be completed using known tools — stop and ask, do not improvise

---

**Last Updated:** 2026-03-30
