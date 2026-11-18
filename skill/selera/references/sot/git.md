# Git and collaboration

> Last verified: 2026-11-16

Scope: commits, branches, PRs, merges, review comments.

## Commits

Conventional Commits: `type(scope): summary`. Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`, `ci`. Imperative mood, lowercase, no trailing period, subject up to 72 characters.

One commit, one reason. Reformatting commits are split from logic commits. Ticket IDs go in the footer.

## Branches

Trunk-based by default: short branches from `main`, merged within days. GitHub Flow if review is mandatory. Git Flow only for scheduled releases.

Names: `feat/order-export`, `fix/pool-timeout`, `chore/bump-deps`.

## PRs

- At most 400 diff lines, excluding generated files. Split anything larger.
- Description: what, why, how to test, risks.
- Review labels: `issue:`, `suggestion:`, `nit:`, `question:`, `praise:`.
- Merge: squash, rebase, or merge commit. Pick one per repo.

## Avoid

Commits named "fix", "update", or "wip". Force-pushing to shared branches. Merging with red CI. Reviews that only comment on cosmetics.
