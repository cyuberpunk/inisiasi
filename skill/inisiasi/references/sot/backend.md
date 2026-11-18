# Backend

> Last verified: 2026-11-16

Scope: server frameworks, ORMs, queues, payments per language. TS combinations: [stack-compat-ts.md](stack-compat-ts.md). Architecture patterns: [architecture.md](architecture.md).

## Defaults per language

| Language | Stack |
|--------|-------|
| TypeScript | Hono (runs on Node, Bun, and Workers) + Drizzle + tRPC or oRPC + Better Auth |
| Go | Chi (or `net/http` ServeMux for small APIs) + pgx + sqlc + slog + OpenTelemetry |
| Python | FastAPI + Pydantic v2 + SQLAlchemy 2 / SQLModel + Postgres |
| Rust | Axum + SQLx + tracing |

## Per layer

| Layer | TypeScript | Go | Python | Rust |
|-------|-----------|-----|--------|------|
| Alternative frameworks | Elysia (Bun), Fastify, NestJS (large teams) | Echo, Gin | Django (admin, batteries included), Litestar | Actix-web |
| ORM / query | Drizzle. Prisma if the team prefers schema-first. Mongoose only for MongoDB | sqlc + pgx. GORM if the team already uses it | SQLAlchemy 2, Django ORM | SQLx. SeaORM |
| Queue | pg-boss, Graphile Worker, BullMQ (Redis) | River (Postgres), Asynq (Redis) | Dramatiq, Celery. procrastinate (Postgres) | NATS, apalis |
| Auth | Better Auth | Validate sessions/JWTs from an IdP | Authlib or an IdP | JWTs from an IdP |
| Payments | Stripe, Polar | Stripe | Stripe | Stripe |

## Backend shape (TS)

- Separate server (`apps/server`): the default when there are mobile or many clients.
- API inside the web app (Next.js route handlers, TanStack Start server functions): small apps with one client.
- Convex: a managed backend with DB, API, and realtime built in. Do not add an ORM or tRPC on top.

## Uploads

The client requests a presigned URL, uploads directly to object storage, and the backend saves the metadata. Details: [data-services.md](data-services.md).

## Avoid

- ARQ (Python) for new projects: maintenance only.
- FastAPI Users for new projects: maintenance mode.
- Express as the default for new projects. Still valid for existing code.
- Treating Better Auth as a Go/Python SDK. It is a TS library; other backends only need to validate sessions/JWTs.
