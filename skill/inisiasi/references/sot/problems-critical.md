# Critical problems

> Last verified: 2026-11-20
> Reviewed 2026-11-20 on a re-read. No tool versions here, content unchanged.

Scope: the most expensive mistakes if made from the start. Read before writing Risks in ARCHITECTURE.md. For symptoms during an incident: [diagnosis.md](diagnosis.md).

| Problem | Prevent with |
|---------|--------------|
| Lost update on money or stock (app reads, computes, writes) | Atomic update + guard: `UPDATE ... SET stock = stock - :q WHERE id = :id AND stock >= :q`. Many fields: optimistic locking (`version`). Several rows: `SELECT ... FOR UPDATE`. A Redis lock is no substitute for a DB constraint |
| Double charge, duplicate orders | Idempotency key per business action, store the first result. Disabling the button is not enough |
| Fake payment events | Verify signature + timestamp, then make the handler idempotent |
| Access to other people's data (IDOR) | Server-side authorization per record, deny by default, negative tests |
| RLS leaks between tenants | `FORCE ROW LEVEL SECURITY`, `SET LOCAL` per transaction, fail-closed policies, `security_invoker` views, never `USING (true)` |
| Connection acquisition timeouts | Fix slow queries, leaks, and long transactions first. `statement_timeout`, `idle_in_transaction_session_timeout` |
| Money stored as float | Integers in the smallest unit, or `numeric` |
| Secrets in git or logs | Secrets manager, scanning, log redaction, rotation if leaked |
| Backups never restored | Scheduled restore tests |
| Injection | Schema validation at the boundary, parameterized queries, never interpolate into a shell |
| CSRF | `SameSite` + CSRF token. Bearer headers are not subject to classic CSRF |
| JWT not validated | Allowlist the alg, check `iss`, `aud`, `exp` |

Checkout: lost update, idempotency, webhooks, money as float. Stock: lost update. Multi-tenant: RLS, IDOR. Uploads: content validation, path traversal, size.
