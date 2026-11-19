# TypeScript stack compatibility

> Last verified: 2026-11-16

Scope: frontend, backend, runtime, database, ORM, and API combinations that are safe to assemble. Read this before writing ARCHITECTURE.md for a TS stack.

## Defaults

- Prototype: TanStack Router or TanStack Start + Hono + SQLite + Drizzle + Better Auth + pnpm workspaces.
- Production: swap SQLite for Postgres (Neon, Supabase, or self-hosted Postgres).
- Edge on Cloudflare: Workers + Hono + D1 (SQLite) + Drizzle.

## Combination rules

| If | Then | Do not |
|-------|-------|---------|
| MongoDB | Mongoose or Prisma | Drizzle (no MongoDB support) |
| SQLite, Postgres, MySQL | Drizzle or Prisma | Mongoose |
| Cloudflare Workers | Hono, Drizzle or Prisma, D1, Turso, or Postgres via Hyperdrive | Express/Fastify as the default (they depend on the Node compatibility layer), Mongoose |
| D1 | SQLite database, Workers runtime | Postgres/MySQL ORM dialects |
| Vue, Svelte, Solid, Astro | oRPC | tRPC (its official integration targets React/Next) |
| React, Next, TanStack, Expo | tRPC or oRPC | |
| Convex | Convex replaces the DB, ORM, and API layer | Adding Drizzle/Prisma/tRPC on top |
| Better Auth | Needs a server and, if there is a DB, an ORM adapter | Use without a backend |
| Desktop (Tauri, Electrobun) | A web frontend that can be exported statically | SSR-only apps without an export |

## Quick picks

- SEO, RSC: Next.js. The API can live inside the app (route handlers) if it is small.
- SPA, routing control: TanStack Router. Fullstack: TanStack Start.
- Web + mobile sharing code: TanStack/Next + Expo + Uniwind, with types and schemas in `packages/`.
- Payments/subscriptions: Polar or Stripe. Polar has a Better Auth plugin.
- Realtime + managed backend: Convex.

## Avoid

- SolidStart for new projects (discontinued in the Solid 2.0 cycle).
- Auth.js for new projects (it is now part of Better Auth).
- Vercel Edge Functions (deprecated). Use Vercel Functions (Node, Fluid compute).
