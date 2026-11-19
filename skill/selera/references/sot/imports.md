# Imports and exports

> Last verified: 2026-11-16

Scope: paths, aliases, export shape, barrels, dependency direction.

## Paths

Default absolute alias: `@/` for `src/`. Relative imports only for siblings in the same folder.

Never go up more than two relative levels (`../../`). If you need to go up three, use an alias or the structure is wrong.

## Exports

- Default: named exports. They make renames, usage search, and tree shaking easier.
- Default exports only for files the framework requires (Next.js pages and layouts) and config files.
- `export *` is forbidden outside a public module barrel.
- Types: `import type` / `export type`, so they disappear at compile time.

## Barrels and public boundaries

Barrels (`index.ts`) exist only at public module boundaries: `packages/ui/index.ts`, `modules/order/index.ts`. Inside a module, import the file directly.

What a barrel exports is the API; everything else is internal. Boundary linters (`eslint-plugin-boundaries`, `dependency-cruiser`) enforce this in CI.

## Order and direction

1. Node built-ins, 2. external dependencies, 3. internal packages, 4. local aliases, 5. relative, 6. styles. One blank line between groups, alphabetical within a group. The formatter or `eslint-plugin-import` sorts them.

Dependencies flow one way: `app -> features -> shared`. No imports back. Cycles are forbidden; detect them with `madge` or `dependency-cruiser`.
