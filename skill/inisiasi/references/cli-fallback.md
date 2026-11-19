# CLI fallback

Use when the `inisiasi` MCP is not connected. Note the fallback in the worklog.

Run `inisiasi <command>` if it is on PATH, else `node <skill-real-path>/../../mcp/dist/cli.js <command>`.

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

No `dist/` either: read `<skill-real-path>/../../mcp/catalog.json` and pick by `tags` and `domain`.
