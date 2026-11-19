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

## AGENTS_WORKLOG.md entry

```md
## YYYY-MM-DD HH:MM:SS TZ | <agent> | inisiasi
- **Status:** `completed`
- **Update:** Stack <one line>. <n> skills picked. MCP or fallback used.
- **Files:** `docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`
- **Validation:** <validate_docs result, or self-check>
- **Next:** Task 1 spike.
```
