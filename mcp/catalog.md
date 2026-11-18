# Catalog curation

`catalog.json` is the data behind the inisiasi MCP. Every entry is a real skill checked at its own GitHub source and against the `skills` CLI.

## Criteria

An entry goes in only if all of these hold:

1. **Real source.** The `SKILL.md` exists in a public GitHub repo and its frontmatter `name:` matches the entry.
2. **Installable.** `npx skills add <owner/repo> --list` shows the `name`, so `npx skills add <owner/repo> -g -s <name>` resolves. Skills in nested folders (for example `packages/*/skills`) often do not show up: leave them out.
3. **Maintained.** Repo not archived, pushed in the last 6 months. `last_pushed` records the date; older entries stay but are counted by `npm run validate`.
4. **Useful.** A real need in one of the domains below. Official vendor skills first, then the most used community skill for the job. Skills that maintain a repo's own code (backport, release, triage) are not for users: leave them out.
5. **Best of its kind.** When several skills do the same job, keep the official one or the most used one, plus at most one alternative.

`popularity` is the GitHub stars of the source repo. For multi-skill repos it is a repo signal, not a per-skill one. 161 older entries also carry `ui_skills_count`, the number the ui-skills.com directory showed; it is not stars and is kept only for reference.

## Scope

Every entry has a `scope`:

- `tech`: helps build software. This is what `recommend_bundle` (and so the inisiasi skill) returns.
- `general`: writing, documents, research, productivity, social media. Found through `recommend_skills` and `search_skills`.

`recommend_skills` takes an optional `scope`. Without it, both scopes are searched.

## Unverified entries

`verified: false` always comes with a `note`. Such entries stay in the file and in `get_skill` and `search_skills`, but `recommend_skills` and `recommend_bundle` never return them. The usual cause is an install command that `skills add --list` does not resolve (a bundle named as a skill, or a sub-command of one skill).

## Domains

| Domain | Entries | Scope |
|---|---|---|
| `design` | 98 | tech |
| `frontend` | 70 | tech |
| `core-and-utilities` | 56 | tech |
| `document` | 24 | general |
| `backend` | 23 | tech |
| `ai-and-data-science` | 21 | tech |
| `testing-and-qa` | 20 | tech |
| `infrastructure` | 18 | tech |
| `security` | 18 | tech |
| `business-and-productivity` | 17 | general |
| `architecture` | 16 | tech |
| `automation-tools` | 15 | tech |
| `social-media` | 14 | general |
| `research` | 13 | general |
| `general` | 10 | general |

`tier` is `main` or `support`. Older entries use `main`/`support` as the `niche` too; new entries use a topic slug (`auth`, `cloudflare`, `agents`).

## Checking the catalog

```sh
cd mcp
pnpm run check-catalog            # report: missing repos, archived, stale, not installable
pnpm run check-catalog -- --write # also refresh popularity (stars), last_pushed and verified/note
```

Needs `gh` (logged in) and network. The install check runs `npx skills add <repo> --list` once per repo and takes several minutes. Add `--no-install` to skip it.

## Adding an entry

1. Run `npx skills add <owner/repo> --list` and copy the exact skill name.
2. Find its `SKILL.md` on GitHub and read the frontmatter `name` and `description`.
3. Append to `skills` in `catalog.json`:

   ```json
   {
     "id": "<name>",
     "name": "<name>",
     "domain": "<domain>",
     "niche": "<topic-slug>",
     "creator": "<person or org>",
     "use_cases": ["<what it does, one line>", "<when to use it>"],
     "tags": ["<lowercase keywords people use to describe projects>"],
     "source_url": "https://github.com/<owner>/<repo>/tree/<branch>/<dir>",
     "install_command": "npx skills add <owner>/<repo> -g -s <name>",
     "popularity": <repo stars>,
     "verified": true,
     "tier": "main",
     "scope": "tech",
     "last_pushed": "YYYY-MM-DD"
   }
   ```

4. Tags drive `recommend_skills` (a tag hit scores 3, niche/domain/name words 2, use-case words 1, all weighted by how rare the word is in the catalog). Use the words a person would write in a project description: frameworks (`nextjs`, `swiftui`), platforms (`macos`, `android`), concerns (`auth`, `rag`, `payments`).
5. Run `pnpm test` (validate, build, tests).

## Left out on purpose

- Aggregator and "awesome" lists (`github/awesome-copilot`, `ComposioHQ/awesome-claude-skills`, `VoltAgent/*`, `sickn33/*`): they point to other repos, so the source repo is listed instead.
- Huge vendor sets where most skills are product-internal (`PostHog/skills` 363, `microsoft/skills` 211, `trailofbits/skills` 97, `JetBrains/skills` 130): add single skills by hand when a project needs them.
- Skills that only exist to maintain a project's own repo (`openai/openai-agents-python`, `vercel/next.js`, `facebook/react`).
- Skills shipped inside npm packages or nested plugin folders that `skills add` cannot see (`TanStack/router`).
- Domain-specific sets outside software building (finance, blockchain scanners, game engines).
- Near-duplicates: one Matt Pocock / pstack / superpowers skill per job.
