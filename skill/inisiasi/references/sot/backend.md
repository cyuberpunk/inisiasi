# Backend

> Terakhir diverifikasi: 2026-11-16

Scope: framework server, ORM, queue, payment per bahasa. Kombinasi TS: [stack-compat-ts.md](stack-compat-ts.md). Pola arsitektur: [architecture.md](architecture.md).

## Default per bahasa

| Bahasa | Stack |
|--------|-------|
| TypeScript | Hono (jalan di Node, Bun, dan Workers) + Drizzle + tRPC atau oRPC + Better Auth |
| Go | Chi (atau `net/http` ServeMux untuk API kecil) + pgx + sqlc + slog + OpenTelemetry |
| Python | FastAPI + Pydantic v2 + SQLAlchemy 2 / SQLModel + Postgres |
| Rust | Axum + SQLx + tracing |

## Per layer

| Layer | TypeScript | Go | Python | Rust |
|-------|-----------|-----|--------|------|
| Alternatif framework | Elysia (Bun), Fastify, NestJS (tim besar) | Echo, Gin | Django (admin, batteries), Litestar | Actix-web |
| ORM / query | Drizzle. Prisma jika tim prefer schema-first. Mongoose hanya MongoDB | sqlc + pgx. GORM jika tim sudah biasa | SQLAlchemy 2, Django ORM | SQLx. SeaORM |
| Queue | pg-boss, Graphile Worker, BullMQ (Redis) | River (Postgres), Asynq (Redis) | Dramatiq, Celery. procrastinate (Postgres) | NATS, apalis |
| Auth | Better Auth | Validasi session/JWT dari IdP | Authlib atau IdP | JWT dari IdP |
| Payment | Stripe, Polar | Stripe | Stripe | Stripe |

## Bentuk backend (TS)

- Server terpisah (`apps/server`): default bila ada mobile atau banyak klien.
- API di dalam app web (Next.js route handler, TanStack Start server function): app kecil, satu klien.
- Convex: backend terkelola dengan DB, API, dan realtime bawaan. Jangan tambah ORM atau tRPC di atasnya.

## Upload

Klien minta presigned URL, upload langsung ke object storage, backend simpan metadata. Detail: [data-services.md](data-services.md).

## Hindari

- ARQ (Python) untuk project baru: maintenance-only.
- FastAPI Users untuk project baru: maintenance mode.
- Express sebagai default project baru. Masih valid untuk kode existing.
- Better Auth dianggap SDK Go/Python. Itu library TS; backend lain cukup memvalidasi session/JWT.
