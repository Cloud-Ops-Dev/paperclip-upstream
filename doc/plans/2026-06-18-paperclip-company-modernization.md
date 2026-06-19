# Paperclip Company Modernization Plan

Date: 2026-06-18
Status: active execution plan
Tracking bead: `infra-v5b`
OpenBrain Docs hub: `18 June Paperclip Update`

## Goal

Modernize all five current service-host Paperclip companies for the newly
installed Paperclip version, not only future templates.

Shell Corp remains active and runnable. Agent-Cloud, En Fuego Cigars,
Novique.ai, and St. Benedict's Anglican Church remain paused unless the board
explicitly approves reactivation.

## Live Inventory Snapshot

| Company | Status | Agents | Projects | Issues | Routines | Execution workspaces | Runtime services | Work products |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Agent-Cloud | paused | 10 | 5 | 535 | 2 | 8479 | 0 | 0 |
| En Fuego Cigars | paused | 3 | 1 | 0 | 0 | 0 | 0 | 0 |
| Novique.ai | paused | 4 | 3 | 3 | 0 | 1 | 0 | 0 |
| Shell Corp | active | 7 | 7 | 790 | 5 | 946 | 0 | 0 |
| St. Benedict's Anglican Church | paused | 7 | 3 | 135 | 2 | 175 | 0 | 0 |

Important findings from the live service-host database:

- Shell Corp has failed current agents: `Gemini Test Engineer` and
  `Opportunity Scout`.
- St. Benedict's has a failed `QA Agent`.
- En Fuego's three `process` agents have no recorded runs.
- Shell Corp has seven root agents and no issue-level workspace links, which is
  an old operating pattern for a company that should now use stronger org,
  workspace, and work-product surfaces.
- All companies currently have zero `issue_work_products`.
- No company has recorded workspace runtime-service rows.
- Several live configs still contained operator-workstation paths in the
  service-host instance before the first migration pass.
- A follow-up live pass found company skill `source_locator` values that still
  pointed at c-desktop-era paths. Thirteen rows were repaired to verified
  service-host paths and logged in Paperclip `activity_log`.
- A broad current-state scan found stale workspace paths that are not safe to
  rewrite blindly: 9,601 active `execution_workspaces.cwd` values still point
  at operator-workstation locations, and four Agent-Cloud project execution
  policies point at a missing service-host worktree target. Track this as
  blocker bead `infra-v5b.5.4` before closing or rewriting workspace rows.

## Required Live Updates

### Path and Workspace Reconciliation

Replace stale operator-workstation paths in live Paperclip state with valid
service-host paths when the target exists:

| Surface | Current drift | Target |
|---|---|---|
| Agent adapter configs | operator-workstation `.paperclip` paths | `/home/<service-user>/.paperclip/...` |
| Agent adapter configs | operator-workstation project paths | `/home/<service-user>/IDE/...` |
| Project workspaces | operator-workstation project paths | `/home/<service-user>/IDE/...` |
| Company skill locators | operator-workstation skill paths | verified `/home/<service-user>/IDE/...` skill directories |
| Execution workspaces | old active workspace cwd values | classify before rewrite; do not update when target directories are missing |

Do not replace paths blindly. If the service-host target does not exist, record
the item as blocked instead of inventing a path.

2026-06-18 live update: company skill locators were repaired for verified
targets. Execution workspace cwd values and Agent-Cloud worktree policy remain
blocked pending classification because the direct target directories are absent.

### Agent Modernization

For each agent:

- verify adapter type is still appropriate for the company role
- verify status and last run state
- verify instructions are reachable on the service host
- assign company skills deliberately instead of relying only on installed skill
  rows
- prefer managed instruction bundles and company skills over copied prompt
  blobs
- keep paused-company agents idle/paused without triggering heartbeats

### Workspace Modernization

Move future work toward:

- project workspaces with valid service-host local paths or repo URLs
- explicit issue workspace preferences for work that needs isolated execution
- managed runtime commands/services instead of ad hoc background processes
- close/cleanup strategy for old active execution workspace sprawl

The existing thousands of active execution workspace records should not be
bulk-deleted without a separate cleanup plan. First classify them, then close or
archive only with a reversible evidence trail.

### Skill Modernization

Normalize the company skill model around the installed Paperclip skill library:

1. install/import skills into `company_skills`
2. assign needed skills to agents explicitly
3. keep provenance, compatibility, trust level, and sharing metadata meaningful
4. avoid duplicating the same local-path skills across future company packages
   when a catalog or referenced source is better

### Routine Modernization

Routines should use the current routine model:

- assigned agent and project
- triggers
- `coalesce_if_active` or other explicit concurrency policy
- `skip_missed` or other explicit catch-up policy

Paused-company routines must remain paused. Long copied "efficiency rules"
blocks should be moved into reusable skills or agent instructions where that
reduces duplication.

### Artifact and Work Product Modernization

Future deliverables must create issue attachments and work products. Local file
paths and comments are not enough for board review.

Use the repo skill helper when running inside a Paperclip heartbeat:

```sh
skills/paperclip/scripts/paperclip-upload-artifact.sh path/to/output \
  --title "Deliverable title" \
  --summary "Short review summary"
```

Workspace-only files should use `metadata.resourceRef.kind: "workspace_file"`
with workspace-relative paths.

## Future Company Template Standard

Future companies should be authored as markdown-first Agent Companies packages:

```text
COMPANY.md
agents/<slug>/AGENTS.md
projects/<slug>/PROJECT.md
tasks/<slug>/TASK.md
skills/<slug>/SKILL.md
.paperclip.yaml
```

Rules:

- base package files hold portable company, agent, project, task, and skill
  semantics
- `.paperclip.yaml` holds Paperclip-specific adapter, runtime, env, routine, and
  workspace fidelity
- never export live database ids, timestamps, secret values, secret version refs,
  or machine-local absolute paths as canonical template data
- use source references for external skills instead of silently vendoring them
- use `COMPANY.md` plus `README.md` and `LICENSE` for human-readable packages

## Execution Phases

1. Durable setup: OpenBrain Docs hub/subpages, beads epic/children, Open Brain semantic-memory capture.
2. Before-state inventory and gap matrix.
3. Safe live updates: path/config reconciliation, status-preserving metadata
   cleanup, workspace metadata fixes.
4. Company-by-company agent, skill, routine, workspace, and work-product
   modernization.
5. Repo-tracked template/runbook updates.
6. Verification and after-state documentation.

## Validation Checklist

- OpenBrain Docs hub and subpages exist.
- Beads epic `infra-v5b` and child beads exist on the service host.
- Open Brain contains the modernization decision memory.
- All five companies have before/after state documented.
- Paused companies remain paused.
- Shell Corp remains active and runnable.
- Stale operator-workstation paths are eliminated or explicitly blocked.
- Current workspace path leftovers are classified before any bulk close/archive
  or path rewrite.
- Future company templates and runbooks are updated in repo-tracked files.
- No persistent c-desktop state is modified.
