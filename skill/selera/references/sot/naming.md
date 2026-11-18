# Naming

> Last verified: 2026-11-16

Scope: variable, function, file, folder, database object, and CSS class names.

## Case styles

| Style | Use for |
|---|---|
| `camelCase` | Variables, functions, properties, parameters |
| `PascalCase` | Types, classes, components, enums |
| `SCREAMING_SNAKE_CASE` | Module constants that are truly fixed |
| `kebab-case` | File, folder, route, package, and CSS class names |
| `snake_case` | Database columns, external API JSON keys |

Do not mix styles within one layer. If an API sends `snake_case`, convert it at the boundary, not across the whole app. Hungarian notation: no.

## Semantic names

- Booleans: `is`, `has`, `can`, `should`, `did`. `isLoading`, not `loading`.
- Functions: verb plus object. `fetchOrders`, `parsePlan`, `canRetry`.
- Handlers: `handleSubmit` (internal), `onSubmit` (prop).
- Forbidden: uncommon abbreviations, magic numbers in names (`data2`), type prefixes (`strName`), double negatives (`isNotDisabled`).
- Plural collections, singular elements: `orders` / `order`.
- A name must read as a sentence without a comment.

## Files and folders

- File names follow the main export: `OrderCard.tsx`, `order-service.ts`.
- One concept per file. `utils.ts` and `helpers.ts` are forbidden as catch-all buckets.
- Index files act as barrels only at public module boundaries.

## Database and CSS

Plural table names: `orders`. Foreign keys: `<table>_id`. Indexes: `idx_<table>_<column>`. Constraints: `<table>_<column>_<kind>`. CSS: one methodology per project. Utility-first Tailwind for new React code; BEM only for plain CSS.
