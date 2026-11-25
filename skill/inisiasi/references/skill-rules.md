# Rules for inisiasi, MCP, and selera

Three pillars. Each pillar has one job. Do not mix them.

| Pillar | Job |
|---|---|
| MCP | Find and recommend skills |
| inisiasi | Blueprint: PLAN becomes ARCHITECTURE and TASKS, and it runs for the whole project |
| selera | Record the owner's preferences, tech decisions, and code standards |

Owner target: anyone starting a project or a stack, from people who have never coded to developers new to the chosen stack, for web apps, digital platforms, integrations, dashboards, AI agents, SaaS, and tools. Platforms: web, desktop (Linux, Windows, macOS), iOS, iPadOS, Android, hybrid. Not a corporate team. Explain in plain words when the owner is new; stay terse when they are not.

## 1. Choosing skills (MCP)

1. Active limit: 2 to 3 cross-cutting skills and 1 to 3 stack-specific skills. At most 6 at once.
2. Remove what is finished before installing something new.
3. A skill must be relevant to the current task and fit the target platform. No speculative skills.
4. Two skills with the same role are not active together. Pick one and state why.
5. Order: `main` first, `support` only when the task has a concrete need. The score sets the order but is not the only reason.
6. Check before recommending: the skill is live, `verified`, does not overlap, and fits the platform.
7. Save tokens: read the summary, and open SKILL.md only for candidates you will recommend.
8. Bundle (`bundle: true`): always run `--list` first and pick per skill. Never install a whole bundle.

## 2. Recommendation format

Every recommendation includes:
- One recommendation with a one-sentence reason.
- The rejected alternative, when there is a real choice, and its risk: token cost, overlap, maintenance, security.
- The install command, not run until the owner confirms.

Act like a tech decision assistant: prevent problems before they happen, not just answer.

## 3. inisiasi runs for the whole project

Not only once at kickoff. Work repeats when triggered.

| Trigger | Action |
|---|---|
| PLAN, TASKS, or selera changes | Check drift between selera, ARCHITECTURE, and TASKS |
| Owner runs the check command | Check drift now, then report |
| A task needs a new capability | Recommend at most one stack-specific skill, with options and risks |
| No trigger | Silent. No recommendations |

No automatic check runs on every session.

## 4. Writing to selera

Three paths:

| Path | When | Permission |
|---|---|---|
| Owner states a preference | Any time in the session | No permission asked. Run `set` and confirm in one line |
| `selera setup` | Owner runs it | Owner fills in or skips |
| inisiasi infers a new tech decision | When PLAN, ARCHITECTURE, or TASKS changes | Propose it, owner confirms |

A recorded value is never overwritten silently. An unrecorded preference means the SoT applies, not a guess.

## 5. Asking questions

Ask only when the answer changes the stack, the data model, or v1 scope. At most 3 questions, each with a recommendation.
