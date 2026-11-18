# Functions, variables, flow

> Last verified: 2026-11-16

Scope: function shape, size limits, early return, immutability, ternaries.

## Shape

- Arrow functions for callbacks and components. `function` for named declarations that get hoisted.
- IIFEs only for top-level await in one-shot scripts.
- `async/await` over promise chains. `.then` only for a one-line transform.

## Limits

| Limit | Value |
|---|---|
| Parameters | 3; beyond that, use an options object |
| Function length | 40 lines or one screen |
| Indentation depth | 3 |
| Cyclomatic complexity | 10 |

Early return and guard clauses go first. Pure functions are preferred; side effects are stated in the name.

## Variables and flow

- `const` by default, `let` only when reassigned. Reassigning parameters is forbidden.
- Non-mutating methods: `map`, `filter`, `toSorted`. Mutation only on new local objects.
- `===` and `!==`. `==` only for `x == null`.
- No magic numbers or strings. Lift them into named constants.
- Declarative for transforms. `for` only for `break`, indexes, or measured performance.
- Ternaries for two short choices. Nested ternaries are forbidden.
