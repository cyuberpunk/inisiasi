# Project structure

> Last verified: 2026-11-16

Scope: repo shape, root directory, test placement, folder patterns, directory hygiene.

## Repo

A monorepo only when there is more than one deployable or a shared package. Otherwise one repo, one app. Do not use polyrepos for a single product.

Monorepo: `apps/`, `packages/`, `tools/`. One package manager only. Runner: Turborepo for TypeScript, Nx only when you need generators and a large graph.

## Root directory

| Path | Contents |
|------|-----|
| `src/` | Application code. No code at the root apart from config |
| `public/` | Static assets served as-is |
| `scripts/` | Automation run by humans or CI |
| `docs/` | Documents, ADRs in `docs/adr/` |
| `tests/` | Only when tests are not co-located |

The root holds only config, README, lockfiles, and metadata files.

## Tests

Default is co-located: `order-service.test.ts` next to its source. Move tests to `tests/` only for E2E and fixtures shared across features. Do not use two patterns in one app.

## Folder patterns

| Pattern | Use when |
|------|-------------|
| Feature-based | Default. One folder per domain, containing components, hooks, queries, and tests |
| Layer-based | Small apps, or teams that think in technologies |
| Feature-Sliced Design | Large frontends, many teams, need hard boundaries |
| Atomic Design | Design systems, not apps |
| Clean / Hexagonal | Complex domain logic that must be free of the framework |

One pattern per app. Do not mix layers and features in one app.

## Hygiene

- Maximum folder depth 4. Beyond that, flatten.
- Rule of three: abstract after three real occurrences, not two.
- No `misc`, `temp`, `old`, or `backup` folders. If it is unused, delete it.
- Singular folder names (`order/`), unless the folder really is a collection (`packages/`).
