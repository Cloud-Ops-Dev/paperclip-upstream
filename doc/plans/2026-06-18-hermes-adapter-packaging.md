# Hermes Adapter Packaging Decision

Date: 2026-06-18
Status: Accepted for the HenkDz/Paperclip fork

## Decision

Hermes should use the same Paperclip adapter contract as built-in runtimes such as
`claude_local`, `codex_local`, and `gemini_local`, but it should be distributed
as an external adapter plugin rather than compiled into Paperclip core.

Once loaded, Hermes can still present the adapter type `hermes_local`. The
important boundary is packaging and ownership: Paperclip core should not import
Hermes-specific server or UI code directly. Hermes should be registered through
the Adapter manager using `@henkey/hermes-paperclip-adapter` or a local `file:`
package path.

## Rationale

Paperclip is the control plane, not the execution plane. Core should define the
agent lifecycle, issue/run orchestration, budgets, approvals, work products, and
the generic adapter interface. Runtime-specific behavior should live behind that
interface whenever it can.

Hermes is also not just another model CLI wrapper. It is a broader orchestration
system with its own auth, relay behavior, skills, workflows, and operational
lifecycle. Keeping it as an external plugin lets Hermes evolve independently
while still participating in Paperclip through the normal adapter surface.

## Arguments For Built-In Hermes

- Lower setup friction: a fresh Paperclip checkout can create Hermes agents
  immediately.
- First-party feel: Hermes appears beside local built-ins such as Claude, Codex,
  Gemini, OpenCode, Pi, and Cursor.
- Simpler default tests and demos: the server can assume the adapter exists.
- Bundled fallback: an external plugin override can be disabled while a built-in
  implementation remains available.

## Arguments Against Built-In Hermes

- Version coupling: Paperclip core updates would also update Hermes adapter
  behavior, even when the operator did not intend to change Hermes.
- Debug ambiguity: `hermes_local` could come from either the bundled adapter or
  an external override, making runtime provenance harder to reason about.
- Core bloat: Hermes-specific imports, config docs, parser behavior, and
  execution details make the control plane less generic.
- Operational mismatch: Hermes has a separate lifecycle and surrounding systems,
  especially in the Novique/clay-blade environment.
- Plugin architecture validation: keeping Hermes external proves the adapter
  plugin path can carry serious runtimes, not just toy integrations.

## Consequences

- Paperclip core should not list `hermes-paperclip-adapter` in `server`
  dependencies.
- Paperclip core should not import from `hermes-paperclip-adapter` or
  `hermes-paperclip-adapter/server`.
- `hermes_local` should not be registered as a built-in adapter type.
- Hermes UI behavior should come from the plugin's config schema and UI parser,
  not from hardcoded Paperclip UI logic.
- Documentation may describe Hermes as a recommended or blessed external
  adapter, but installation should still flow through the Adapter manager.

## Migration Note

The upstream update branch may still contain built-in Hermes wiring. That is an
upstream packaging choice, not the fork decision. When carrying upstream forward
onto `feat/externalize-hermes-adapter`, preserve the generic external adapter
infrastructure and remove the direct Hermes dependency/registration from core.
