# Formatting

> Last verified: 2026-11-16

Scope: indentation, line width, quotes, semicolons, braces. The formatter decides, not debate.

## Machine rules

The formatter decides, not the reviewer. The values below are examples, not requirements: what matters is that one value is chosen, written in the config, and followed by everyone. Config lives in the repo and runs in pre-commit and CI.

| Item | Example choice (one per repo, written in the config) |
|------|---------|
| Indentation | 2 spaces (TS/JS/JSON/CSS), tabs for Go, 4 spaces for Python/Rust |
| Line width | 100. 80 only for old code, 120 for repos that already use it |
| Quotes | Double for TS/JS, single for Python |
| Semicolons | Required in TS/JS |
| Trailing comma | `all` |
| End of file | One newline, no trailing whitespace |
| Braces | K&R. Allman only when the language requires it |

## Human rules

- Do not break lines by hand when the formatter can do it.
- Long chained calls: one method per line after the first dot.
- More than 3 parameters: one per line.
- Multi-line strings use template literals, not concatenation.
- Large diffs caused by reformatting are split from logic commits.
