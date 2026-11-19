# Multi-tenancy

> Last verified: 2026-11-16

Scope: data isolation between tenants. Common patterns: [architecture.md](architecture.md). Wrong RLS: [problems-critical.md](problems-critical.md).

- Default: shared DB + a `tenant_id` column + Row Level Security.
- Safe RLS: set the tenant per transaction with `SET LOCAL app.tenant_id` (or `set_config(..., true)`), enable `FORCE ROW LEVEL SECURITY`, and use a fail-closed policy: `tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid`. The app connects as a non-owner role without `BYPASSRLS`.
- Session-level `SET` leaks between tenants under PgBouncer transaction pooling. Always use `SET LOCAL` inside a transaction.
- Schema per tenant or database per tenant only for contractual isolation, at higher operational cost.
- Indexes start with `tenant_id`. Rate limits and quotas per tenant. Cross-tenant tests in CI.
