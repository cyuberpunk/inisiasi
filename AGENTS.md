# AGENTS.md

Guidance for coding agents working on inisiasi: a kickoff skill (`skill/inisiasi/`), a standards skill (`skill/selera/`), and a local MCP server and CLI (`mcp/`). README.md explains what the project does.

These rules favor caution over speed. For a trivial change, use judgment.

## 1. Think before coding

- State your assumptions. If a request can be read more than one way, name the readings and ask; do not pick one silently.
- If a simpler approach exists, say so before building the requested one.
- Find the owner of the behavior before editing:
  - skill instructions: `skill/*/SKILL.md` and `skill/*/references/*.md`
  - stack knowledge: `skill/inisiasi/references/sot/`
  - catalog data: `mcp/catalog.json` (criteria in `mcp/catalog.md`)
  - tool behavior: `mcp/src/`, and `skill/selera/scripts/selera.mjs`
- What a skill promises must match what the tools do. A change on one side usually needs the other side, a test, and the docs.
- Ask before you add a reference file, an MCP tool or a catalog domain, change the PLAN, ARCHITECTURE, TASKS or GUIDE format (the skill, `templates.md`, `validate_docs` and the evals all depend on it), or do anything that publishes: `npm publish`, making the repo public, pushing.

## 2. Simplicity first

- Write the minimum that solves the request. No options, flags or abstractions nobody asked for.
- No new dependency unless it removes real complexity. `mcp/` has two runtime dependencies (`@modelcontextprotocol/sdk`, `fuse.js`); `selera.mjs` has none and stays that way.
- The skills and the MCP server ship separately, so the small profile parser duplicated in `selera.mjs` and `mcp/src/drift.ts` is intended. Keep the two in step with the test in `mcp/test/drift.mjs`; do not share code across them.
- In skill text, state each rule once, where the agent reads it.

## 3. Surgical changes

- Touch only what the request needs. Match the existing style, even where you would write it differently.
- Edit `mcp/catalog.json` entries in place. Do not reformat the file (2-space JSON).
- If you see an unrelated problem, mention it. Do not fix it unasked.
- Remove only what your own change made unused.
- Do not edit the owner's `~/.config/inisiasi/selera/profile.md` or any agent or MCP config unless asked.
- Every changed line should trace back to the request.

## 4. Goal-driven execution

Turn the request into checks before you edit. For multi-step work, write the plan as `step → verify: check`.

- Bug in `mcp/src/`: add a failing assertion in `mcp/test/` (or a case in `mcp/test/qa.mjs`), then fix it.
- Skill behavior change: update or add the matching case in `skill/*/evals/evals.json`. Real eval runs (`node evals/harness.mjs run`) cost model calls; ask first. `node evals/harness.mjs self-test` is free.
- Source of truth edit: check the claim on the web, update `Last verified`, and say on the next line what you checked and what you did not.
- Catalog entry: `npx skills add <repo> --list` must show the name, and the repo must have been pushed in the last six months.
- Packaging change: `cd mcp && pnpm pack`, then check the tarball list.

Run before you report done:

- `cd mcp && pnpm install && pnpm test`: validates the catalog, builds the server, runs every tool, and fails on a source-of-truth file older than six months.
- `cd mcp && node test/qa.mjs`: usability, relevance, boundary, safety and skill checks. All must pass.
- `sh skill/selera/scripts/check.sh`: every selera command.

## Project rules

- Node 22 or newer, pnpm 12.
- No em or en dashes in source-of-truth files, skills or docs.
- PLAN section headings stay in English: `inspect_plan` matches them.
- Commits follow Conventional Commits. Commit and push only when asked.
- Never commit `.agents/`, `.claude/`, `.grok/`, `.opencode/skills/`, `anti-slop/`, `web/`, `skills-lock.json` or `docs/*.bak-*`.
