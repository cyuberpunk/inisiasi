# Tasks

- [ ] 1. Spike: measure `recommend_skills` on 10 real project descriptions, Indonesian and English. Verify: a recorded hit rate per description in `AGENTS_WORKLOG.md`.
- [x] 2. Stop generic words ("agent", "cli", "tools") from ranking docs skills and vendor CLIs first. Verify: `node mcp/test/qa.mjs` passes R1 and R2.
- [x] 3. Make `validate_docs` errors name the expected section format. Verify: `node mcp/test/qa.mjs` passes U2.
- [x] 4. Expand `~` in project root paths. Verify: `node mcp/test/qa.mjs` passes U3.
- [x] 5. Make `search_skills` reject an unknown domain like `list_domain_skills` does. Verify: `node mcp/test/qa.mjs` passes U4.
- [x] 6. List `selera` in the README skill tree. Verify: `node mcp/test/qa.mjs` passes K2.
- [ ] 7. Align `mcp/` and `web/` with the selera profile (pnpm, vitest, vite, oxlint+oxfmt, zod, shadcn, tanstack-query): add `oxfmt`, apply vitest, or record each exception in selera. Verify: `node mcp/dist/cli.js drift .` shows no `missing_in_architecture` or `missing_in_tasks` item.
