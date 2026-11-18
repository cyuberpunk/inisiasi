# Plan: inisiasi

Goal: turn the goals of a new project into the agent skills to install, a tech stack, an architecture, and first tasks, so later sessions build instead of re-deciding. Ships as a skill plus a local MCP server that serves a curated skill catalog.

## Goals

- Recommend agent skills from a curated catalog for a project description.
- Write `docs/ARCHITECTURE.md` and `docs/TASKS.md` from `docs/PLAN.md`.
- Record the owner's code standards (selera) and flag drift against the docs.
- Run locally with no network dependency.

## MVP

- MCP server with 10 tools: catalog lookup, plan inspection, doc validation, stack detection, reference selection, bundle recommendation.
- Skills `inisiasi` and `selera`, with CLI fallback for every MCP tool.
- Catalog of 407 verified skills across 15 domains.

## Constraints

- Node 20 or newer, TypeScript, `@modelcontextprotocol/sdk` over stdio.
- Catalog is a local file (`mcp/catalog.json`), re-read on every call.
- No network calls at runtime.

## Non-goals

- Installing skills automatically. Install commands are shown, never run without a yes.
- Scaffolding application code.
- Hosting or a web UI for the catalog.

## Open questions

None.
