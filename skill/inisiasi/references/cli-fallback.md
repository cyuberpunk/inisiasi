# CLI fallback

Use when the `inisiasi` MCP is not connected. Note in the worklog which route you used.

Try these in order and use the first one that runs:

1. `inisiasi <command>` when it is on PATH.
2. `npx -y -p inisiasi-mcp inisiasi <command>` (Node 22 or newer). It downloads the published package on first use.
3. `node <skill-real-path>/../../mcp/dist/cli.js <command>` inside a checkout of the inisiasi repo.

If none runs, say so in one line and continue without the tools: scan the project yourself as in step 0, read `docs/PLAN.md` directly, and choose references from `references/sot/README.md`. Without the catalog, skip skill recommendations and say why. Do not name a skill or an install command you have not read from a source.

| Command | Same as MCP tool |
|---|---|
| `detect_stack <root>` | detect_stack |
| `inspect_plan <path>` | inspect_plan |
| `recommend_bundle [--root <path>] [--plan <path>] [--limit <n>] <description>` | recommend_bundle |
| `select_references [--plan <path>] <description>` | select_references |
| `recommend "<sentence>"` | recommend_skills |
| `search <q>` | search_skills |
| `domains` / `domain <slug>` | list_domains / list_domain_skills |
| `get <id>` | get_skill |
| `validate_docs <root>` | validate_docs |
| `drift [root]` | CLI only: selera tool keys vs ARCHITECTURE and TASKS |
