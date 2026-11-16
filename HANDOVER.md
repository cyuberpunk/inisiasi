# inisiasi handover

For OMP and later sessions. Snapshot of 2026-11-16 (Asia/Jakarta), not source of truth. Trust `SKILL.md`, the MCP, and the SoT.

## What this is

Two skills and one MCP in `~/project/inisiasi`.

- **inisiasi** turns `docs/PLAN.md` into a decided stack, the skills to install, `docs/ARCHITECTURE.md`, and `docs/TASKS.md`.
- **selera** records the owner's code standards and applies them: CLI, profile, 10-file SoT.
- **mcp/** is a local stdio MCP server with a CLI that has the same commands.

## Layout

| Path | What |
|---|---|
| `skill/inisiasi/SKILL.md` | 870 words. Flow in 6 steps, two confirmation stops |
| `skill/inisiasi/references/` | `plan-gate.md`, `cli-fallback.md`, `templates.md`, `prompts.md`, `sot/` |
| `skill/inisiasi/references/sot/` | 36 files, 9.616 words, all `> Terakhir diverifikasi: 2026-11-16` |
| `skill/inisiasi/evals/` | 8 evals with assertions, 2 of them negative triggers |
| `skill/selera/SKILL.md` | 856 words. Intent-based triggers, scope and key map |
| `skill/selera/references/sot/` | 10 files, 1.898 words: naming, structure, imports, formatting, functions, design, types, git, testing |
| `skill/selera/scripts/selera.mjs` | `learn`, `setup`, `show`, `set`, `apply`, `tree`. No dependencies |
| `skill/selera/scripts/check.sh` | Smoke test. Every documented command must run |
| `mcp/` | 10 read-only tools plus CLI |
| `mcp/catalog.json` | 159 skills, 15 domains. **Not curated yet.** Owner will review |

Symlinks and overrides:

- `~/.agents/skills/inisiasi` -> `skill/inisiasi`. `~/.agents/skills/selera` -> `skill/selera`.
- `_references` -> `skill/inisiasi/references/sot`. Real files live in the skill.
- `$INISIASI_REFERENCES`, `$INISIASI_SKILLS_DIR`, `$INISIASI_CATALOG` override the defaults.
- selera profile: `~/.config/inisiasi/selera/profile.json`, project override `.selera/profile.json`, env `SELERA_CONFIG`.

Owner bias lives in the SoT as a label, not as law: TypeScript with Vite+, Apple native, Postgres, Cloudflare. A deviation gets named with its reason.

## MCP tools

All read-only. The agent writes files.

- `list_domains`, `list_domain_skills`: catalog browsing
- `search_skills`, `recommend_skills`, `get_skill`: catalog lookup
- `inspect_plan`: PLAN completeness, open questions. Placeholder answers such as "None" or "Tidak ada" no longer count as open.
- `detect_stack`: manifests, languages, frameworks, docs stub state
- `select_references`: short SoT list with `verified_at`, `stale`, `gaps`
- `recommend_bundle`: plan, stack, references, and skills in one call
- `validate_docs`: post-write gate

CLI: `node ~/project/inisiasi/mcp/dist/cli.js <command>`, or `inisiasi` if on PATH. Command list in `skill/inisiasi/references/cli-fallback.md`.

## inisiasi flow

0. Detect with `detect_stack`.
1. Plan gate. An open question blocks only if it changes the stack, the data model, or v1 scope. In order: answered already, settled by SoT or platform convention, or a real question. Real questions: at most 5 in one message, each with a recommendation. Rules and PLAN format: `references/plan-gate.md`.
2. Context. Prefer one `recommend_bundle` call with `limit` 10. Read only the returned references.
3. Propose. Stack, skills, module layout, riskiest assumption, then stop for go. If the owner already said to write the docs and nothing is open, write in the same turn and lead with the stack line.
4. Write after go. Back up existing docs as `*.bak-YYYYMMDD`. Write ARCHITECTURE, TASKS (5 to 12, task 1 is the risk spike), and a worklog entry. Leave `docs/DESIGN.md` alone.
5. Validate with `validate_docs`, then report the stack line, install commands, and first 3 tasks.

## selera flow

1. `show`. An empty profile is normal, the SoT covers universal practice.
2. A stated preference is a `set`, not a question. Never invent a key.
3. Read `references/sot/README.md`, then only the groups the task needs.
4. Profile wins over the SoT, the SoT wins over generic convention. Name the deviation.

Keys are `concern` or `scope.concern`, with scopes `fe`, `be`, `mobile`, `cli`, `infra`. A value may be a comma list in preference order. `schema` is an alias for `validation`.

`learn` reads lockfiles, dependencies, configs, and git log. It does not read chat history. `tree` prints the real repo structure, not the recorded intent.

## State today

- `cd mcp && npm test` passes: catalog check, `tsc`, docs, stack, smoke, and placeholder open-question test.
- `skill/selera/scripts/check.sh` prints `OK: selera commands`.
- `quick_validate` passes for both skills.
- 0 em dashes, 0 broken relative links, 0 backup files in the skill dirs.
- MCP registered in Claude Code at user scope: `node /Users/cyuber/project/inisiasi/mcp/dist/server.js`. Restart the host after a rebuild.

## Review scores

Reviewed against the skill-creator rubric, 2026-11-16. These are judgment, not model runs.

| Dimension | inisiasi | selera |
|---|---|---|
| Validation | 5 | 5 |
| Triggering | 4 | 4 |
| Progressive disclosure | 4 | 4 |
| Clarity | 4 | 4 |
| Accuracy | 4 | 3 |
| Eval evidence | 3 | 4 |
| Cleanliness | 5 | 5 |
| Mean | 4,1 | 4,1 |

Eval result, iteration 3, inisiasi: 100% with the skill against 43% without. Iteration 5 re-ran evals 1, 2, 3 after the SKILL.md trim and all passed. Eval 6 fails by design until a stack exists, so it does not accept a bare "go" as approval.

## Open items

1. **Catalog curation.** 159 skills, never reviewed by the owner. Until then, skill recommendations are a draft.
2. **selera eval 5 and 7 need a real repo.** Both currently run against an empty fixture. `~/project/kura` works as a read-only fixture.
3. **Graders.** Eval scoring is manual. A script that writes `grading.json` from assertions would make scores comparable across iterations.
4. **fuu.** Deferred by the owner. When resumed: write the folder-scope and passphrase answers into `docs/PLAN.md`, then ARCHITECTURE and TASKS (both stubs). Back up first, never touch `docs/DESIGN.md`.
5. **`learn` gaps.** It does not recognise `naming.function` or `naming.component`, and it only reads repo signals, not chat.
6. **selera eval 6 baseline** was never run because the child-agent limit was hit.
7. Optional: register the MCP in Codex and Cursor. Snippets in `README.md`.

## Constraints

- Do not touch `docs/DESIGN.md`.
- Back up a doc before writing it (`*.bak-YYYYMMDD`).
- Do not install skills or scaffold app code unless asked.
- SoT stays lean and current: no deprecated or unmaintained tool, no em dashes.
- Do not enable Agent Reach login channels, change DNS, or resume stale harness todos without consent.

## Verify

```sh
cd ~/project/inisiasi/mcp && npm test
sh ~/project/inisiasi/skill/selera/scripts/check.sh
node ~/project/inisiasi/mcp/dist/cli.js detect_stack ~/project/kura
node ~/project/inisiasi/mcp/dist/cli.js inspect_plan ~/project/fuu
node ~/project/inisiasi/skill/selera/scripts/selera.mjs learn
```
