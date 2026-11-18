# Architecture: inisiasi

## Summary

A local stdio MCP server plus two skills. The server answers catalog and project-doc questions from files on disk. The skills decide what to do with the answers. Nothing leaves the machine.

## Stack

| Concern | Choice | Why | Rejected |
|---|---|---|---|
| Language | TypeScript, compiled with `tsc` | Typed tool schemas, already in use | Plain JavaScript: no types for tool contracts |
| Runtime | Node.js 20 or newer | Matches `engines` in `mcp/package.json` | Bun: not needed for a stdio server |
| MCP | `@modelcontextprotocol/sdk` over stdio | Standard client support | Custom protocol: no benefit |
| Fuzzy search | `fuse.js` | Already a dependency, no index to maintain | Full-text database: overkill for 407 entries |
| Package manager | pnpm 12, `pnpm-lock.yaml`, `packageManager` field | Matches selera (`packageManager: pnpm`) | npm: the lockfile it replaced |
| Tests | Node scripts using `node:assert` | No test framework to maintain | vitest: recorded in selera, not yet applied here |

## Architecture

- `mcp/src/server.ts`: MCP entry point, registers the 10 tools.
- `mcp/src/cli.ts`: same queries from the command line.
- `mcp/src/catalog.ts`: loads `mcp/catalog.json`, search, recommend.
- `mcp/src/inspectPlan.ts`, `validateDocs.ts`, `detectStack.ts`, `selectReferences.ts`, `recommendBundle.ts`: project-doc tools.
- `mcp/src/drift.ts`: compares selera profile with ARCHITECTURE and TASKS.
- `skill/inisiasi/`: the kickoff skill and its references.
- `skill/selera/`: the code-standards skill and its CLI (`scripts/selera.mjs`).

## System design

- Data model: skill entries (`id`, `domain`, `niche`, `tags`, `use_cases`, `popularity`, `verified`, `install_command`) in `mcp/catalog.json`. Plan sections (Goals, MVP, Constraints, Non-goals, Open questions) in `docs/PLAN.md`.
- Data flow: tool call, then read the file per call, then parse, then return JSON. No cache, no write.
- Storage: files only. Catalog in the repo, project docs in the caller's project root, selera profile in `~/.config/inisiasi/selera/profile.json` and `./.selera/profile.json`.
- Trust boundaries: tool arguments that are paths are resolved against the given root. Missing files return a result, never a crash. Search input is capped at 200 characters and 12 terms.
- Failure modes: a missing catalog or docs returns `isError` with the next step. A malformed plan returns `title_only` instead of guessing.
- Scale: 407 entries, read in full per call. Fine up to a few thousand entries. Past that, index the catalog once at startup.

## Agent skills

- `inisiasi`: `npx skills add` is not needed; installed as a symlink to `skill/inisiasi`.
- `selera`: installed as a symlink to `skill/selera`.
- No external skills are required for this repo.

## MCP servers

- `inisiasi` (this repo, stdio): the catalog for this project. Project-doc tools exist only here.
- `skill-issue` (remote, user-level, `https://skill-issue.in/api/mcp`): exposes the same 5 catalog tools. Duplicate.
- Decision: keep `inisiasi`. `skill-issue` removed from the user config with `claude mcp remove skill-issue` (done 2026-11-18).

## Rejected alternatives

- Vector search for the catalog: 407 entries do not need embeddings.
- A web UI: the owner uses the terminal and the MCP.

## Risks

- Search quality on non-English or generic queries. Measured by `mcp/test/qa.mjs`.
- Stack drift: this file must change when `mcp/package.json` changes. `drift` reports the gap.
