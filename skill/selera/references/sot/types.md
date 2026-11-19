# Types, errors, logging

> Last verified: 2026-11-16

Scope: strict typing, boundary validation, null safety, errors, logs.

## Types

- Full TypeScript `strict`, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. `any` is forbidden; use `unknown` and narrow it.
- Python: annotations on public functions, `mypy` or `pyright` in CI.
- Data from outside (APIs, env vars, forms) is validated at the boundary with a schema (Zod, pydantic). After that, the type is trusted.
- Unions, not free strings: `"pending" | "paid"`.
- `null` for no value, `undefined` for not provided. Pick one per context.

## Errors

- Own error classes: a machine code, a message for the user, and internal details in `cause`.
- Result/Either for expected failures. Exceptions for bugs and unexpected failures.
- Do not swallow errors. A `catch` with no action or rethrow is forbidden.
- Global handler at the boundary: full log, generic response, no stack trace.
- Fail closed for authentication and authorization.

## Logging

- Levels: DEBUG, INFO, WARN, ERROR. FATAL only for a process that is stopping.
- Structured JSON with `request_id`, `trace_id`, `user_id` (hashed if sensitive).
- Log at the boundary: incoming requests, outgoing calls, errors.
- Never log secrets, tokens, or raw PII.
