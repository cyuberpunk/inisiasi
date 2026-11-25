# Templates

## docs/ARCHITECTURE.md

```md
# Architecture

## Summary
<2-3 lines: what, for whom, the shape of the system.>

## Stack
| Layer | Choice | Why | Rejected |
|---|---|---|---|
| Language | | | |
| UI | | | |
| Storage | | | |
| Build/CI | | | |

## Non-negotiables
<every rule from PLAN, one per line, plus any the stack adds. Omit the section only when PLAN has none.>

## Architecture
<Components and who owns what. Module boundaries. A small diagram (mermaid or ASCII) if it helps.>

## System design
- **Data model:** <core types and their relations>
- **Data flow:** <main paths, step by step>
- **Storage:** <where state lives, persistence, migrations>
- **Trust boundaries:** <inputs to validate, secrets, permissions>
- **Failure modes:** <what breaks and what happens>
- **Scale:** <expected load; what changes at 10x>

## Agent skills
| Skill | Why | Install | Verified |
|---|---|---|---|

```sh
<all install commands, one per line>
```

## Rejected alternatives
- <option>: <why not>

## Risks
- **Riskiest assumption:** <...> → spike: <...>
```

## docs/TASKS.md

```md
# Tasks

- [ ] 1. Spike: <riskiest assumption> → verify: <observable check>
- [ ] 2. <task> → verify: <check>
```

## docs/GUIDE.md

For the owner, in plain words. Write it for someone who has not used this stack before.

```md
# Guide

## What we are building
<One plain paragraph: what the app does, for whom, and what v1 includes.>

## The stack in plain words
| Part | Tool | What it does for you |
|---|---|---|
| <for example: Database> | <Postgres> | <Keeps your data safe when the app restarts> |

## Setup
1. Install <tool> from <official link>. Check it worked: `<command> --version`.
2. <Get the code and install dependencies: exact commands.>
3. Run the project: `<command>`. You should see: <what the owner sees when it works>.
4. Run the tests: `<command>`. You should see: <passing output>.

If a step fails: <the most likely cause and its fix, one line each>.

## Glossary
| Term | Meaning |
|---|---|
| <every technical term used in ARCHITECTURE.md and TASKS.md> | <one plain sentence> |
```

Take every command from the SoT, the tool's official docs, or the repo's own scripts. In an existing project, the setup steps are the ones the repo already uses.

## AGENTS_WORKLOG.md entry

```md
## YYYY-MM-DD HH:MM:SS TZ | <agent> | inisiasi
- **Status:** `completed`
- **Update:** Stack <one line>. <n> skills picked. MCP or fallback used.
- **Files:** `docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`, `docs/GUIDE.md`
- **Validation:** <validate_docs result, or self-check>
- **Next:** Task 1 spike.
```
