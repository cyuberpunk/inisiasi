# Contributing

Pull requests are welcome. The author reviews and merges every change. Small, focused PRs get reviewed fastest.

## Before you open a PR

```sh
cd mcp && pnpm install && pnpm test
```

`pnpm test` validates the catalog, builds the server, and runs every tool. A PR that fails it will not be merged.

## What fits

- **A catalog entry.** Follow [mcp/catalog.md](mcp/catalog.md). The entry needs a real source, an install command that resolves, and recent activity.
- **A fix or an update to a reference file** in `skill/inisiasi/references/sot/`. Check the claim against its official source on the web, update the `Last verified` date, and name what you checked and what you did not on the line below it. Files older than six months fail the test suite. Do not use em or en dashes in these files.
- **A bug fix** in `mcp/src/`. Add a test or an assertion in `mcp/test/` that fails without the fix.

Something bigger, such as a new tool or a new reference file? Ask the author before you build it, so you do not spend time on something that will not be merged.

## Sign your commits

Every commit carries a `Signed-off-by` line, which certifies the [Developer Certificate of Origin](https://developercertificate.org/):

```sh
git commit -s -m "docs(sot): correct the Vite version"
```

By signing off, you confirm that you wrote the change or have the right to submit it, and that it is released under this project's license, GPL-3.0-or-later.

## Commit style

[Conventional Commits](https://www.conventionalcommits.org/), for example `feat(catalog): add fastapi skill` or `docs(sot): re-verify security.md`.
