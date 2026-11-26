# inisiasi

Local MCP server and CLI for [inisiasi](https://github.com/cyuberpunk/inisiasi), a kickoff skill that turns `docs/PLAN.md`, or an existing codebase without architecture docs, into a decided stack, architecture, first tasks and a setup guide.

The package carries a curated catalog of 439 agent skills and 56 dated source-of-truth files. It reads local files only and makes no network calls.

Requires Node 22 or newer.

## Use with an agent

Register the server (Claude Code shown):

```sh
claude mcp add inisiasi --scope user -- npx -y -p inisiasi inisiasi-mcp
```

Other agents: use `npx` as the command and `["-y", "-p", "inisiasi", "inisiasi-mcp"]` as the arguments.

Install the two skills that drive it:

```sh
npx skills add cyuberpunk/inisiasi --full-depth -g -s inisiasi
npx skills add cyuberpunk/inisiasi --full-depth -g -s selera
```

Then open a project and tell your agent `inisiasi`.

## Use from the terminal

```sh
npx -y -p inisiasi inisiasi recommend "Tauri desktop app"
npx -y -p inisiasi inisiasi inspect_plan .
npx -y -p inisiasi inisiasi validate_docs .
```

## Tools

| Tool | What it returns |
|---|---|
| `list_domains` | The 15 catalog domains |
| `list_domain_skills` | Skills in one domain |
| `recommend_skills` | Skills that fit a project description |
| `search_skills` | Skills matching a query |
| `get_skill` | One skill with its install command |
| `inspect_plan` | Missing PLAN sections and the questions still open |
| `validate_docs` | Errors in ARCHITECTURE, TASKS and GUIDE |
| `detect_stack` | Languages, package managers and frameworks in a repo |
| `select_references` | The source-of-truth files to read for a project |
| `recommend_bundle` | References and skills in one call, steered by the selera profile |

Every tool has a CLI twin, plus `drift [root]`.

## License

GPL-3.0-or-later.
