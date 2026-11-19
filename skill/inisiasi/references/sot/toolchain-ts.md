# TypeScript toolchain

> Last verified: 2026-11-16

Scope: lint, format, test, typecheck, build, monorepo, and git hooks for TS/JS projects. The owner's default.

## Defaults

| Layer | Use | Notes |
|-------|-----|-------|
| Toolchain | Vite+ (CLI `vp`) | One entry point: `vp dev`, `vp build`, `vp test`, `vp check` (lint, format, typecheck, test). Stable since 1.0 |
| Bundler | Vite 8 (Rolldown default) | Stable |
| Test | Vitest | Through Vite+ |
| Lint | Oxlint | Stable. Type-aware via `oxlint-tsgolint` |
| Format | Oxfmt | Still beta, Prettier-compatible |
| Typecheck | `tsc` or `vp check` | Default stays `tsc` |
| Monorepo | pnpm workspaces + Turborepo, or Vite+ (`--recursive`, `--filter`) | Nx only for large enterprise monorepos |
| Package manager | pnpm. Alternative: bun | npm is allowed but slower. Do not use Yarn for new projects |
| Git hooks | Lefthook, or `vp` hooks when using Vite+ | Husky + lint-staged only for old repos |
| Secret scan | gitleaks or trufflehog | In hooks and CI |

## Use when

- Biome: the team wants one lint+format binary outside Oxc. Not a default.
- ESLint + Prettier: an old repo, or you need a plugin Oxlint does not have yet.
- Next.js: Oxlint + Oxfmt only. Do not force Vite+ as the bundler for Next.
- TypeScript 7 native preview (`tsgo`, `@typescript/native-preview`) or `tsrs` (Rust port): experiments only, not defaults.

## Related data and VoidZero ecosystem

| Name | What it is | Status in inisiasi |
|------|--------------------|--------------------|
| fate (`react-fate`) | React/Vue data client, Relay-style: normalized cache, data masking, live view over SSE. Template: `vp create fate` | Pick it if the backend is tRPC, GraphQL, or Void and you need a normalized cache. Otherwise TanStack Query |
| Void (void.cloud) | Fullstack CLI, platform, and SDK that deploys to Cloudflare | Optional, not a default |
| fbtee | Compiler-based inline i18n, successor to `fbt` | An i18n option, see [frontend.md](frontend.md) |

The npm package `void` is unrelated. Do not install it.

## Rules

1. CI runs `vp check` (or lint + format check + typecheck + test) and fails on any lint error.
2. Monorepo layout: `apps/web`, `apps/server`, `apps/native`, `packages/*` (ui, db, auth, config). Internal packages use the workspace protocol and are named `@repo/*`.
3. CI runs only the packages that changed (`turbo run build test --filter=...[origin/main]` or `vp --filter`).
4. Commit the lockfile. Bun uses `bun.lock` (text), not `bun.lockb`.
5. Conventional Commits.

## Avoid

- Stacking ESLint + Prettier + Biome + Oxlint in one repo.
- A monorepo for one small app or for unrelated projects.
- Git submodules to share code.
