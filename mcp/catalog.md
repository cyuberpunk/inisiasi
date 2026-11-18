# Catalog curation

`catalog.json` is the data behind the inisiasi MCP. Every entry is a real skill checked at its own GitHub source and against the `skills` CLI.

## Criteria

An entry goes in only if all of these hold:

1. **Real source.** The `SKILL.md` exists in a public GitHub repo and its frontmatter `name:` matches the entry.
2. **Installable.** `npx skills add <owner/repo> --list` shows the `name`, so `npx skills add <owner/repo> -g -s <name>` resolves. Skills in nested folders (for example `packages/*/skills`) often do not show up: leave them out.
3. **Maintained.** Repo not archived, pushed in the last 6 months. `last_pushed` records the date; older entries stay but are counted by `npm run validate`.
4. **Useful.** A real need in one of the domains below. Official vendor skills first, then the most used community skill for the job. Skills that maintain a repo's own code (backport, release, triage) are not for users: leave them out.
5. **Best of its kind.** When several skills do the same job, keep the official one or the most used one, plus at most one alternative.

`creator` is the GitHub owner of the install repo, one spelling per owner. Related orgs of one vendor share a creator (`google` covers google, google-gemini, GoogleChrome, googleworkspace; `vercel` covers vercel-labs). `npm run validate` rejects a split creator.

`popularity` is the GitHub stars of the source repo. For multi-skill repos it is a repo signal, not a per-skill one. 122 older entries also carry `ui_skills_count`, the number the ui-skills.com directory showed; it is not stars and is kept only for reference.

## Scope

Every entry has a `scope`:

- `tech`: helps build software. This is what `recommend_bundle` (and so the inisiasi skill) returns.
- `general`: writing, documents, research, productivity, social media. Found through `recommend_skills` and `search_skills`.

`recommend_skills` takes an optional `scope`. Without it, both scopes are searched.

## Unverified entries

`verified: false` always comes with a `note`. Such entries stay in the file and in `get_skill` and `search_skills`, but `recommend_skills` and `recommend_bundle` never return them. The usual cause is an install command that `skills add --list` does not resolve (a bundle named as a skill, or a sub-command of one skill).

## Domains

| Domain | Entries | Scope | Niches |
|---|---|---|---|
| `design` | 87 | tech | visual-style, ui, 3d, animation, design-system, critique, antislop, landing, platform-guidelines, figma, generative-art, accessibility, brand, video |
| `core-and-utilities` | 63 | tech | review, workflow, skills, tooling, coding-discipline, git, session, debugging, verification, typescript, code-design, agents, python, refactoring, performance, release, prototype |
| `frontend` | 44 | tech | 3d, animation, react, components, css, web-platform, vue, tooling, performance, figma, accessibility, nextjs, browser-extension, angular |
| `mobile` | 31 | tech | ios, react-native, android, expo, cross-platform |
| `architecture` | 28 | tech | planning, patterns, modeling, design, refactoring, codebase-mapping, review, decisions |
| `ai-and-data-science` | 27 | tech | agents, llm-api, rag, prompting, models, evals, ml-apps, data-viz, mcp |
| `document` | 24 | general | docs, anti-slop, office, diagrams, agent-docs, copywriting, slides, media |
| `backend` | 23 | tech | database, node, baas, api, email, python-api, serverless, payments |
| `automation-tools` | 22 | tech | browser, agents, ci-cd, scripting, figma, video |
| `security` | 22 | tech | auth, guardrails, appsec, crypto, secrets, agent-security, supply-chain |
| `testing-and-qa` | 21 | tech | unit, qa, e2e, accessibility, tdd, react, experimentation |
| `infrastructure` | 18 | tech | release, cloudflare, deploy, iac, monorepo, observability, git-hooks, serverless |
| `business-and-productivity` | 17 | general | seo, google-workspace, marketing, sales, notes, market-research, product, writing, workflow, issues, decision |
| `general` | 14 | general | writing, gamedev, inspiration, autonomous, launch, education, learning |
| `research` | 12 | general | deep-research, scraping, web-search, academic, codebase-mapping, extraction, autonomous, writing |
| `social-media` | 10 | general | content, x, youtube, research, short-video, linkedin, instagram |

`niche` is the subdomain: a topic inside the domain (`ios`, `react`, `database`, `auth`). Pick one already listed for that domain before inventing a new one. `tier` (`main` or `support`) is separate. `npm run validate` rejects `main`/`support` as a niche, and a scope that does not match the domain.

`mobile` holds native app work (iOS, Android, React Native, Expo). Web UI stays in `frontend`, even for mobile-sized screens.

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
     "niche": "<topic inside the domain>",
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
