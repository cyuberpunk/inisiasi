# inisiasi

Project kickoff skill plus a local MCP server. The skill turns `docs/PLAN.md` goals into agent skills to install, a tech stack, architecture and system design (`docs/ARCHITECTURE.md`, `docs/TASKS.md`). The MCP serves the skill catalog with the same 5 catalog tools as [skill-issue.in](https://skill-issue.in/), plus project-doc tools (`inspect_plan`, `validate_docs`, `detect_stack`, `select_references`, `recommend_bundle`). Backed by a local file. No network.

```
skill/inisiasi/   SKILL.md, references/templates.md, references/prompts.md, references/sot, evals/evals.json
skill/selera/     SKILL.md, scripts/selera.mjs, references/sot, evals/evals.json
mcp/              stdio MCP server (TypeScript, @modelcontextprotocol/sdk)
mcp/catalog.json  curated skill catalog (433 skills, 15 domains, tech and general scope)
mcp/catalog.md    curation criteria and how to add entries
```

## Install

```sh
cd mcp && pnpm install && pnpm run build   # npm test = validate catalog + build + docs/stack tests + smoke of all 10 tools
ln -s "$PWD/../skill/inisiasi" ~/.agents/skills/inisiasi
```

## Three tools

| Tool | Scope | Job |
|---|---|---|
| MCP (curated catalog) | Wide: tech and general (writing, documents, research, productivity) | Find and recommend skills. Entries are checked for a real source, an install command that resolves, and recent activity |
| `inisiasi` skill | Tech only | From goals to stack, design and first tasks. Calls `recommend_bundle`, which returns tech-scope skills only |
| `selera` skill | Tech only | Records the owner's code standards. A recorded tool choice (`fe.ui: shadcn`, `packageManager: pnpm`) steers `recommend_bundle` toward matching skills and labels why (`selera: ["fe.ui=shadcn"]`); `drift` checks the docs against it |

The MCP serves both skills. Anything outside tech goes through `recommend_skills` or `search_skills`, not through inisiasi.

## Tools

| Tool | Args |
|---|---|
| `list_domains` | none |
| `list_domain_skills` | `domain`, `limit?` |
| `recommend_skills` | `project_description`, `scope?` (`tech` or `general`), `limit?` |
| `search_skills` | `query`, `domain?`, `limit?` |
| `get_skill` | `id` |
| `inspect_plan` | `path`, `max_questions?` |
| `validate_docs` | `root` |
| `detect_stack` | `root` |
| `select_references` | `project_description?`, `plan_path?`, `limit?` |
| `recommend_bundle` | `project_description?`, `root?`, `plan_path?`, `limit?` |

`limit` defaults to 8, max 25. Catalog is re-read on every call. Entries with `verified: false` are never recommended. Audit the catalog with `pnpm run check-catalog` (see `mcp/catalog.md`). Override the path with `INISIASI_CATALOG=/path/catalog.json`.

No MCP? Same queries from the CLI: `node mcp/dist/cli.js recommend "macOS menubar app in SwiftUI"` (`domains`, `domain <slug>`, `search <q>`, `get <id>`, `inspect_plan <path>`, `validate_docs <root>`, `detect_stack <root>`, `select_references [--plan <path>] <description>`, `recommend_bundle [--root <path>] [--plan <path>] [--limit <n>] <description>`).

## Register the MCP

Server command: `node /Users/cyuber/project/inisiasi/mcp/dist/server.js`

**Claude Code**
```sh
claude mcp add inisiasi --scope user -- node /Users/cyuber/project/inisiasi/mcp/dist/server.js
```

**Codex** (`~/.codex/config.toml`)
```toml
[mcp_servers.inisiasi]
command = "node"
args = ["/Users/cyuber/project/inisiasi/mcp/dist/server.js"]
```
or `codex mcp add inisiasi -- node /Users/cyuber/project/inisiasi/mcp/dist/server.js`

**opencode** (`~/.config/opencode/opencode.json`)
```json
{
  "mcp": {
    "inisiasi": {
      "type": "local",
      "command": ["node", "/Users/cyuber/project/inisiasi/mcp/dist/server.js"],
      "enabled": true
    }
  }
}
```

**Cursor** (`~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "inisiasi": { "command": "node", "args": ["/Users/cyuber/project/inisiasi/mcp/dist/server.js"] }
  }
}
```

## Catalog entry shape

```json
{
  "id": "swiftui-pro", "name": "swiftui-pro", "domain": "apple", "niche": "swiftui",
  "creator": "Paul Hudson", "use_cases": ["..."], "tags": ["swift", "swiftui"],
  "source_url": "https://github.com/...", "install_command": "npx skills add twostraws/SwiftUI-Agent-Skill -g -s swiftui-pro",
  "popularity": 6566, "verified": true
}
```

Domains and niches come from the entries. `popularity` is GitHub stars of the source repo. `verified` means the SKILL.md was fetched from the linked path.

## Catalog

433 curated skills across 15 domains, each checked at its GitHub source and against `skills add --list`. Criteria, domains and the steps to add an entry are in [`mcp/catalog.md`](mcp/catalog.md). Run `npm run validate` after editing.
