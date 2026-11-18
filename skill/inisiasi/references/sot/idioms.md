# Idioms

> Last verified: 2026-11-18
> Status: draft, pending owner review.

Scope: the idiomatic way to express common ideas in the owner's main languages. Naming, formatting, structure: the selera SoT. Types and boundaries: selera `types.md`.

## TypeScript

| Idea | Idiom |
|------|-------|
| Variants of one thing | Discriminated union on a `kind` field, exhaustive `switch` with a `never` check |
| Fixed lookup table | `const x = {...} as const satisfies Record<K, V>` |
| Expected failure | Return a result (`{ ok: true, value } \| { ok: false, error }`). Throw only for bugs |
| Data from outside | Parse with Zod at the boundary, then trust the inferred type |
| Ids that must not mix | Branded types (`string & { __brand: "UserId" }`) |
| Immutable input | `readonly` arrays and properties in signatures |
| Optional access | `?.` and `??`. Not `\|\|` for defaults that may be `0` or `""` |
| Async fan-out | `Promise.all` for must-all-succeed, `Promise.allSettled` when partial results are fine |
| Cleanup | `using` / `await using` with `Symbol.dispose` where the runtime supports it, otherwise `try/finally` |

## Swift

| Idea | Idiom |
|------|-------|
| Data | `struct` and `enum` first, `class` only for identity or reference semantics |
| Early exit | `guard let` / `guard ... else { return }` |
| Shared mutable state | An `actor`, or `@MainActor` for UI state |
| Variants | `enum` with associated values, exhaustive `switch` |
| Async work | `async/await` and structured concurrency (`async let`, task groups), not callbacks |
| Expected failure | `throws` with a typed error enum, `Result` only at callback boundaries |

## Python

| Idea | Idiom |
|------|-------|
| Data at a boundary | Pydantic model. Internal plain data: `@dataclass(frozen=True)` |
| Resources | `with` context managers |
| Paths | `pathlib.Path`, not string joins |
| Transform a sequence | Comprehensions, generators for large data |
| Variants | `match` statement on a tagged type |

## SQL

| Idea | Idiom |
|------|-------|
| Upsert | `INSERT ... ON CONFLICT ... DO UPDATE` |
| Job queue claim | `SELECT ... FOR UPDATE SKIP LOCKED` |
| Pagination | Keyset (`WHERE id > $last ORDER BY id LIMIT n`), not `OFFSET` on large tables |
| Readable query | CTEs (`WITH`) over nested subqueries |

## Avoid

- Porting idioms across languages (Java-style getters in TS, classes for everything in Swift).
- Clever one-liners a reader has to decode.
