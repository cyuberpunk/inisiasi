# Worklog

## 2026-11-18: audit fixes 1 to 4

- Removed `skill/qa-cases` (not wanted).
- Rewrote `docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md` for this repo. Old files kept as `*.bak-20261118`.
- `selera/scripts/check.sh`: resolve `selera.mjs` to an absolute path before `cd`.
- `mcp/src/catalog.ts` `searchSkills`: one Fuse pass per term, ranked by term hits. Input capped.
- `mcp/src/inspectPlan.ts`: `Goal:` / `MVP:` / `Constraints:` / `Non-goals:` lines count as sections. `title_only` means no body text.
