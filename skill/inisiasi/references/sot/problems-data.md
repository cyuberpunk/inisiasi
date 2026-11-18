# Data and transaction problems

> Last verified: 2026-11-16

Scope: transactions, migrations, consistency. Patterns: [architecture.md](architecture.md).

| Problem | Prevent with |
|---------|--------------|
| A transaction is open during an HTTP call | Keep I/O outside the transaction (outbox) |
| Deadlock / serialization failure | Consistent lock ordering, short transactions, retries |
| One row is contended (hot row) | Atomic updates, split counters, write queues |
| DDL locks a table | Expand/contract, `CREATE INDEX CONCURRENTLY`, `lock_timeout` |
| DB and broker out of sync | Outbox + idempotent consumer |

Postgres never does dirty reads and does not do lock escalation (that is SQL Server). Gap locks are MySQL InnoDB behavior. The main risk in Postgres is lost updates under `READ COMMITTED`.
