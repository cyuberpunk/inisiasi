# Addy agent-skills, index for inisiasi

Source: https://github.com/addyosmani/agent-skills (25 skills, license MIT). Nothing is copied into this repo. Install each skill from source, so the copy matches what users run.
Meta-skill: `using-agent-skills`. Phase map: pick a skill based on the kind of work at hand.

Every name below is a catalog id in `mcp/catalog.json`. Install with its catalog `install_command`: `npx skills add addyosmani/agent-skills -g -s <id>`.
Exception: catalog id `test-driven-development` is obra/superpowers. This map means the Addy one. Install it by name: `npx skills add addyosmani/agent-skills -g -s test-driven-development`.

## Phase map

| Phase | Skill |
|---|---|
| Don't know what to build yet | `interview-me` |
| Rough concept, need variants | `idea-refine` |
| New feature or project | `spec-driven-development` |
| No quality bar yet | `constraint-driven-development` |
| Have a spec, need tasks | `planning-and-task-breakdown` |
| Implementation | `incremental-implementation` |
| UI | `frontend-ui-engineering` |
| API | `api-and-interface-design` |
| Missing context | `context-engineering` |
| Code must match the docs | `source-driven-development` |
| High stakes, unfamiliar code | `doubt-driven-development` |
| Tests | `test-driven-development` (Addy, see above) |
| Tests in the browser | `browser-testing-with-devtools` |
| Something is broken | `debugging-and-error-recovery` |
| Code review | `code-review-and-quality` |
| Too complex | `code-simplification` |
| Security | `security-and-hardening` |
| Performance | `performance-optimization` |
| Git, commits, branches | `git-workflow-and-versioning` |
| CI/CD | `ci-cd-and-automation` |
| Deprecate or migrate | `deprecation-and-migration` |
| Docs, ADRs | `documentation-and-adrs` |
| Logs, metrics, alerts | `observability-and-instrumentation` |
| Release | `shipping-and-launch` |

## Core rules (from `using-agent-skills`)

1. State assumptions before any non-trivial implementation.
2. When confused: stop, say so, ask, and wait.
3. Be willing to reject an approach that is clearly wrong.
