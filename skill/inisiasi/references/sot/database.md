# Database

> Last verified: 2026-11-16

Scope: database choice, hosts, ORMs, schema migrations. Pools, N+1, locks: [problems-data.md](problems-data.md).

## Defaults

- Production: PostgreSQL. Use it unless there is a strong reason not to.
- Prototypes, edge, mobile: SQLite (Turso, Cloudflare D1, expo-sqlite).
- Postgres hosts: Neon (branching), Supabase (if you use its ecosystem), Prisma Postgres, PlanetScale Postgres, AWS RDS/Aurora (enterprise).

| Engine | Use when | Notes |
|--------|-------------|---------|
| PostgreSQL | Almost any app | Default |
| SQLite | Local, edge, mobile, prototypes | Limited ALTER TABLE |
| MySQL | Existing systems, Vitess | |
| MongoDB | Pure document workloads | Mongoose or Prisma, not Drizzle |
| Redis / Valkey | Cache, sessions, queues | Not a primary store |
| ClickHouse / DuckDB | Analytics | Keep separate from the main DB |

## Data modeling

Draft, pending owner review.

- Start normalized (3NF). Every table has a primary key; prefer `bigint` identity or UUIDv7 (`uuidv7()` is built in since Postgres 18) over random UUIDv4 for index locality. UUIDv7 exposes creation time, so do not use it where that leaks.
- Relationships: one-to-many is a foreign key on the many side, indexed. Many-to-many is a join table with a composite primary key and its own columns (role, created_at) when the relationship carries data.
- Put invariants in the database: `NOT NULL`, `UNIQUE`, `CHECK`, foreign keys, exclusion constraints. Application checks alone race.
- Denormalize only for a measured read problem, and say how the copy stays correct: a trigger, a materialized view with a refresh schedule, or an event that updates it. Values derived from the same row: a generated column.
- Soft delete only when the domain needs restore or audit. Then every unique index and query must account for `deleted_at`.
- Store time as `timestamptz` in UTC, money as integers in the smallest unit or `numeric`.
- JSON columns (`jsonb`) for data the app does not filter or join on. Filtered fields become columns.

## Migrations

- Tools: Drizzle Kit, Prisma Migrate, Atlas, golang-migrate, Alembic, sqlx-cli. Lint: Atlas lint or Squawk.
- Breaking changes: Expand (add, nullable) → Migrate (dual write + batched backfill) → Contract (remove the old column after cutover). Postgres automation: pgroll.
- Never rename or change a column type in place.
- Postgres 11+: `ADD COLUMN ... DEFAULT <constant>` is instant. A volatile default (`gen_random_uuid()`) rewrites the table: add it nullable, `SET DEFAULT`, then backfill in batches.
- Indexes on large tables: `CREATE INDEX CONCURRENTLY`. Constraints: `NOT VALID`, then `VALIDATE`.
- Set `lock_timeout` during migrations. Separate schema migrations from data migrations.
- Test on a database branch (Neon, PlanetScale) before production.
- SQLite / D1 / Turso: renaming or changing a type often means creating a new table and copying. Follow the ORM's workflow.
- Large MySQL tables: gh-ost or pt-online-schema-change.

## Rules

Index foreign keys and frequent filters. Avoid N+1. Pooling (PgBouncer or a provider pooler) for serverless. Backups plus PITR. Forward-only migrations in production.
