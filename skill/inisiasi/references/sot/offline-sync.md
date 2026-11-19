# Offline-first and sync

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: Turso sync beta, Replicache, Isar, WatermelonDB, Zero, Electric, PowerSync.

Scope: local-first, sync engines, conflicts.

## Defaults

Start online-only. Grow step by step: optimistic updates + retries, then local persistence for critical data, and only then a sync engine if offline use is truly required.

| Platform | Local store |
|----------|-------------|
| Web | IndexedDB (Dexie), SQLite WASM, PGlite (persisted to IndexedDB/OPFS) |
| Expo / RN | expo-sqlite |
| Flutter | Drift |
| Native | SwiftData, Room, SQLite |

| Sync engine | Use when |
|-------------|-------------|
| Zero | Web + Postgres, partial query-based sync |
| PowerSync | Postgres to mobile (including RN) |
| Turso sync | The DB is already SQLite/Turso (offline writes still in beta) |
| Electric | Read path from Postgres; writes go through your own API. Self-host: Electric Cloud is winding down |
| Yjs, Automerge, Loro | CRDT collaboration |

## Conflicts

- The server is the authority for business data. Field-level merge for documents. CRDTs for collaboration.
- Never use last-write-wins for payments or stock.
- Offline mutations go into a queue, server operations are idempotent, and the sync status is shown to the user.

## Avoid

WatermelonDB, the official Isar (no longer maintained; the isar_community fork is active), Replicache for new projects.
