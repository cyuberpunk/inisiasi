# Plan: inisiasi

Goal: turn the goals of a new project, or an existing codebase without architecture docs, into the agent skills to install, a tech stack, an architecture, first tasks, and a setup guide the owner can follow, so later sessions build instead of re-deciding. For anyone from non-technical owners to developers new to the chosen stack. Ships as a skill plus a local MCP server that serves a curated skill catalog.

## Goals

- Recommend agent skills from a curated catalog for a project description.
- Write `docs/ARCHITECTURE.md`, `docs/TASKS.md` and `docs/GUIDE.md` from `docs/PLAN.md` or from existing code.
- Record the owner's code standards (selera) and flag drift against the docs.
- Run locally with no network dependency.

## MVP

- MCP server with 10 tools: catalog lookup, plan inspection, doc validation, stack detection, reference selection, bundle recommendation.
- Skills `inisiasi` and `selera`, with CLI fallback for every MCP tool.
- Catalog of 439 skills (all verified) across 15 domains.

## Constraints

- Node 22 or newer, TypeScript, `@modelcontextprotocol/sdk` over stdio.
- Catalog is a local file (`mcp/catalog.json`), re-read on every call.
- No network calls at runtime.

## Non-goals

- Installing skills automatically. Install commands are shown, never run without a yes.
- Scaffolding application code.
- Hosting the catalog.

## Open questions

None.
