# Catalog curation

`catalog.json` is the data behind the inisiasi MCP. Every entry is a real skill checked at its own GitHub source.

## Criteria

An entry goes in only if all of these hold:

1. **Real source.** The `SKILL.md` exists at the linked path in a public GitHub repo (checked through the GitHub API tree, then fetched raw). Then `verified: true`.
2. **Installable.** `npx skills add <owner/repo> -g -s <name>` resolves it. `<name>` is the `name:` in the SKILL.md frontmatter.
3. **Maintained.** Repo not archived, pushed in the last few months.
4. **Useful for building software.** Covers a real need in one of the domains below. Marketing, finance, game engines, blockchain and narrow vendor-internal skills are left out.
5. **Best of its kind.** When several skills do the same job, keep the official vendor one or the most used one, plus at most one alternative.

`popularity` is the source repo's GitHub stars at curation time. For multi-skill repos it is a repo signal, not a per-skill one.

## Domains

`frontend`, `design`, `backend`, `database`, `auth`, `devops`, `testing`, `security`, `ai-engineering`, `apple`, `mobile`, `architecture`, `writing`, `engineering` (code quality, debugging, git), `meta` (skill authoring, agent workflow).

Niches are kebab-case slugs inside a domain. Reuse an existing niche before adding one (`npm run validate` prints the domain counts; `list_domains` shows the niches).

## Adding an entry

1. Find the skill's `SKILL.md` on GitHub and copy its frontmatter `name`.
2. Append to `skills` in `catalog.json`:

   ```json
   {
     "id": "<name>",
     "name": "<name>",
     "domain": "<domain>",
     "niche": "<niche>",
     "creator": "<person or org>",
     "use_cases": ["<what it does, one line>", "<when to use it>"],
     "tags": ["<lowercase keywords people use to describe projects>"],
     "source_url": "https://github.com/<owner>/<repo>/tree/<branch>/<dir>",
     "install_command": "npx skills add <owner>/<repo> -g -s <name>",
     "popularity": <repo stars>,
     "verified": true
   }
   ```

3. Tags drive `recommend_skills` (a tag hit scores 3, niche/domain/name words 2, use-case words 1). Use the words a person would write in a project description: frameworks (`nextjs`, `swiftui`), platforms (`macos`, `android`), and concerns (`auth`, `rag`, `payments`).
4. Set `verified: false` if you could not open the SKILL.md.
5. Run `npm test` (validate, build, smoke test).

## Left out on purpose

- Aggregator and "awesome" lists (`github/awesome-copilot`, `ComposioHQ/awesome-claude-skills`, `VoltAgent/*`): they point to other repos, so the source repo is listed instead.
- Huge vendor sets where most skills are product-internal (`PostHog/skills` 361, `microsoft/skills` 211): add single skills by hand when a project needs them.
- Domain-specific sets outside software building (`coreyhaines31/marketingskills`, finance, blockchain scanners, game engines).
- Near-duplicates: one Matt Pocock / pstack / superpowers skill per job (for example `tdd` from mattpocock, not tersio).
