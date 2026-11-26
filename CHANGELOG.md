# Changelog

## [0.1.1] - 2026-11-27

### Changed

- inisiasi skill: the interview now has a UX contract. At most 3 questions in total before the proposal (not per message), asked through the host's interactive question tool when one exists. Non-blocking questions are deferred: the assumption is recorded in PLAN, tagged with the task it belongs to, and asked when that task starts.
- inisiasi skill: chat replies have a length budget. Decisions carry one line of reasoning each; tables, evidence and analysis move to docs or the worklog. Technical terms in chat must carry a plain-language gloss or not appear.
- inisiasi skill: clarified the "no menus" rule. A question with concrete options and a marked recommendation is not a menu.

### Added

- Eval 13 (`defer-nonblocking-questions`): a complex paid macOS app scenario, modeled on a real session where the agent asked 19 questions before the owner could say go. Tightened the question-cap assertions in evals 2, 9 and 12.

These changes come from owner feedback on a real run: 11 questions in round 1, 8 more in round 2, typed letter answers, and a 25,000-character plan message. Not yet measured against live models.

## [0.1.0] - 2026-11-25

First public release.

- `inisiasi` skill: project kickoff and stack guide for new projects, existing codebases without architecture docs, non-technical owners and developers new to a stack. Writes PLAN, ARCHITECTURE, TASKS and a beginner GUIDE with setup steps and a glossary, gated on owner confirmation.
- `selera` skill: records and applies owner coding standards in a Markdown profile.
- `inisiasi` npm package: local MCP server (`inisiasi-mcp` bin) and CLI (`inisiasi` bin), 439-skill catalog, 56 dated source-of-truth files, 10 MCP tools. Requires Node 22 or newer.
