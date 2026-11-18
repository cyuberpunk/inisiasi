# Worklog

## 2026-11-18: catalog audit and three-tool alignment

- Audited `mcp/catalog.json` against GitHub and `skills add --list`: 49 of 407 entries were not installable as written (now `verified: false` with a note), 16 repos not pushed in 6 months, `popularity` mixed stars with directory counts (now repo stars; old numbers kept as `ui_skills_count`).
- Added 26 verified entries: SoT defaults that had no skill (hono, convex, workos, temporal, clickhouse, oxlint/oxfmt migration, cloudflare durable-objects), plus fastapi, angular, mastra, pydantic-ai, and general-scope docx, pdf, pptx, xlsx, obsidian, create-prd.
- Every entry has `scope` (tech or general). `recommend_bundle` is tech-only and boosted by the selera profile. `recommend_skills` takes `scope`. Unverified entries are never recommended.
- `mcp/check-catalog.mjs` makes the audit repeatable. `mcp/catalog.md` and README rewritten.

## 2026-11-18: audit fixes 1 to 4

- Removed `skill/qa-cases` (not wanted).
- Rewrote `docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md` for this repo. Old files kept as `*.bak-20261118`.
- `selera/scripts/check.sh`: resolve `selera.mjs` to an absolute path before `cd`.
- `mcp/src/catalog.ts` `searchSkills`: one Fuse pass per term, ranked by term hits. Input capped.
- `mcp/src/inspectPlan.ts`: `Goal:` / `MVP:` / `Constraints:` / `Non-goals:` lines count as sections. `title_only` means no body text.
