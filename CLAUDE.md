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
