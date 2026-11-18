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

## 2026-11-18: catalog curation, creators

- Removed 15 low-profile skills asked for by the owner (all `kemiljk`, plus 8 single skills), then 24 more: 12 not pushed in 6 months (except karpathy-guidelines, stop-slop) and 12 community skills under 100 stars. Vendor-official low-star skills stay. 433 to 394 entries.
- `creator` is now the install-repo owner, one spelling. google, vercel, shadcn, anthropics merged. 153 to 132 creators. `validate.mjs` rejects a split creator.
- Added 31 skills, then 61 more from garrytan/gstack (`--full-depth` finds 70, `-s <name>` installs without it; gstack `retro` skipped, id taken by mattpocock `retro`), from repos the owner tracks, checked against `npx skills add <repo> --list`: `garrytan/gstack` (the CLI exposes 1 skill, `gstack`, not 53), 6 anthropics, 22 mattpocock (all from `mattpocock/skills`, the only repo that resolves). Skipped `template-skill`, `academy-guide`, `brand-guidelines`, `setup-matt-pocock-skills`. 394 to 425 entries.
- Cleared all 43 unverified entries. skills.sh (via ego-browser) showed 19 were bundle or sub-command names (`taste-skill`, `superpowers`, impeccable `polish`/`critique`, ...). 36 deleted, 13 real skills added from `--list --full-depth` (`antislop*`, `deep-research`, `google-agents-cli-*`, `pr-lens`, `linkedin-marketing`, `ig-reel`, ...), 7 now verified (their names resolve with `--full-depth`). 486 to 463 entries, all verified.
- New domain `mobile` (31: ios, android, react-native, expo, cross-platform), moved from frontend, design, backend, security, infrastructure, testing, core. Every `main`/`support` niche replaced by a topic (react, database, auth, ...). Scope now follows domain. `validate.mjs` enforces both. Web domain tab nests domain > niche > skill.
- `GENERIC` now also filters niche and name tokens: niche `agent-docs` had brought R1 back.
- Drafted six inisiasi SoT files (pending owner review): agentic-engineering, agent-loops, agent-graphs, idioms, mechanisms, diagrams. Indexed in the SoT README under "Engineering" and in `selectReferences.ts`. Web: tabs Stack (SoT) and Standards (selera SoT, patterns, Addy strategies, agentic, idioms, mechanisms, C4).
- Backend coverage audit against a 15-topic backend curriculum. Drafted (pending owner review) `scenarios.md`, `scaling.md`, `concurrency.md`, an OAuth/OIDC section in `auth.md`, and a data-modeling section in `database.md`. Textbook fundamentals left out on purpose: the SoT records decisions, not definitions.
